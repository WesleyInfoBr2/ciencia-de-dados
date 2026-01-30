import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para decodificar base64 para Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Função para encontrar e substituir imagens base64 no JSON do TipTap
function processContent(content: any, imagesToUpload: { base64: string; mimeType: string; path: string[] }[], path: string[] = []): any {
  if (!content) return content;
  
  if (Array.isArray(content)) {
    return content.map((item, index) => processContent(item, imagesToUpload, [...path, String(index)]));
  }
  
  if (typeof content === 'object') {
    // Se é um nó de imagem com src base64
    if (content.type === 'image' && content.attrs?.src) {
      const src = content.attrs.src;
      const base64Match = src.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
      
      if (base64Match) {
        const mimeType = base64Match[1];
        const base64Data = base64Match[2];
        const imagePath = [...path];
        
        imagesToUpload.push({
          base64: base64Data,
          mimeType: mimeType === 'jpg' ? 'jpeg' : mimeType,
          path: imagePath
        });
        
        // Retorna o nó com placeholder que será substituído depois
        return {
          ...content,
          attrs: {
            ...content.attrs,
            src: `__PLACEHOLDER_${imagesToUpload.length - 1}__`
          }
        };
      }
    }
    
    // Processar recursivamente outros objetos
    const result: any = {};
    for (const key of Object.keys(content)) {
      result[key] = processContent(content[key], imagesToUpload, [...path, key]);
    }
    return result;
  }
  
  return content;
}

// Substituir placeholders com URLs reais
function replacePlaceholders(content: any, urls: string[]): any {
  if (!content) return content;
  
  if (typeof content === 'string') {
    const match = content.match(/^__PLACEHOLDER_(\d+)__$/);
    if (match) {
      return urls[parseInt(match[1])] || content;
    }
    return content;
  }
  
  if (Array.isArray(content)) {
    return content.map(item => replacePlaceholders(item, urls));
  }
  
  if (typeof content === 'object') {
    const result: any = {};
    for (const key of Object.keys(content)) {
      result[key] = replacePlaceholders(content[key], urls);
    }
    return result;
  }
  
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar posts com imagens base64
    const { data: posts, error: fetchError } = await supabase
      .from('wiki_posts')
      .select('id, title, content')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Erro ao buscar posts: ${fetchError.message}`);
    }

    const results: { postId: string; title: string; imagesProcessed: number; success: boolean; error?: string }[] = [];

    for (const post of posts || []) {
      try {
        const contentStr = JSON.stringify(post.content);
        
        // Verificar se tem imagens base64
        if (!contentStr.includes('data:image')) {
          results.push({
            postId: post.id,
            title: post.title,
            imagesProcessed: 0,
            success: true
          });
          continue;
        }

        console.log(`Processando post: ${post.title} (${post.id})`);
        
        const imagesToUpload: { base64: string; mimeType: string; path: string[] }[] = [];
        const processedContent = processContent(post.content, imagesToUpload);
        
        if (imagesToUpload.length === 0) {
          results.push({
            postId: post.id,
            title: post.title,
            imagesProcessed: 0,
            success: true
          });
          continue;
        }

        console.log(`Encontradas ${imagesToUpload.length} imagens base64`);
        
        // Upload de cada imagem
        const uploadedUrls: string[] = [];
        
        for (let i = 0; i < imagesToUpload.length; i++) {
          const img = imagesToUpload[i];
          const fileName = `wiki/${post.id}/${Date.now()}-${i}.${img.mimeType}`;
          
          const imageBytes = base64ToUint8Array(img.base64);
          
          const { error: uploadError } = await supabase.storage
            .from('wiki-images')
            .upload(fileName, imageBytes, {
              contentType: `image/${img.mimeType}`,
              upsert: false
            });

          if (uploadError) {
            console.error(`Erro ao fazer upload da imagem ${i}: ${uploadError.message}`);
            throw new Error(`Erro no upload: ${uploadError.message}`);
          }

          const { data: publicUrl } = supabase.storage
            .from('wiki-images')
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrl.publicUrl);
          console.log(`Imagem ${i + 1}/${imagesToUpload.length} enviada: ${fileName}`);
        }

        // Substituir placeholders com URLs reais
        const finalContent = replacePlaceholders(processedContent, uploadedUrls);

        // Atualizar o post
        const { error: updateError } = await supabase
          .from('wiki_posts')
          .update({ content: finalContent })
          .eq('id', post.id);

        if (updateError) {
          throw new Error(`Erro ao atualizar post: ${updateError.message}`);
        }

        results.push({
          postId: post.id,
          title: post.title,
          imagesProcessed: imagesToUpload.length,
          success: true
        });

        console.log(`Post ${post.title} atualizado com ${imagesToUpload.length} imagens migradas`);

      } catch (postError) {
        console.error(`Erro no post ${post.id}:`, postError);
        results.push({
          postId: post.id,
          title: post.title,
          imagesProcessed: 0,
          success: false,
          error: postError instanceof Error ? postError.message : 'Erro desconhecido'
        });
      }
    }

    const totalMigrated = results.filter(r => r.success && r.imagesProcessed > 0).length;
    const totalImages = results.reduce((acc, r) => acc + r.imagesProcessed, 0);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          postsProcessed: results.length,
          postsWithMigratedImages: totalMigrated,
          totalImagesMigrated: totalImages
        },
        details: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
