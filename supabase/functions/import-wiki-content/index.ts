import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface WikiContent {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  post_type: 'conteudo' | 'como_fazer' | 'aplicacao_pratica';
  category_slug?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting wiki content import...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request data
    const { author_id } = await req.json();
    
    if (!author_id) {
      throw new Error('author_id is required');
    }

    console.log('Importing content for author:', author_id);

    // Ensure author profile exists (required by FK wiki_posts.author_id -> profiles.id)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', author_id)
      .maybeSingle();

    if (profileCheckError) {
      console.error('Error checking profile:', profileCheckError);
    }

    if (!existingProfile) {
      console.log('Profile not found. Fetching user and creating profile for:', author_id);
      const { data: userResult, error: getUserError } = await supabase.auth.admin.getUserById(author_id);
      if (getUserError) {
        console.error('Failed to fetch auth user:', getUserError);
      } else if (userResult?.user) {
        const u = userResult.user;
        const profilePayload: any = {
          id: author_id,
          email: u.email,
          full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
          username: (u.user_metadata?.username || null),
          bio: (u.user_metadata?.bio || null),
          social_networks: (u.user_metadata?.social_networks || {})
        };
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert(profilePayload)
          .select('id')
          .single();

        if (createProfileError) {
          console.error('Failed to create profile:', createProfileError);
        } else {
          console.log('Profile created for author:', author_id);
        }
      }
    }

    // Main Notion database ID from the provided URL
    const MAIN_DATABASE_ID = '1b302094baca8119b391d6e586174264';
    
    // Mapping for different content types found in the database
    const contentTypeMapping = [
      {
        keywords: ['conceito', 'fundamento', 'teoria', 'introducao'],
        category_slug: 'conteudos',
        post_type: 'conteudo'
      },
      {
        keywords: ['como', 'tutorial', 'guia', 'passo', 'fazer'],
        category_slug: 'como-fazer',
        post_type: 'como_fazer'
      },
      {
        keywords: ['aplicacao', 'pratica', 'projeto', 'caso', 'exemplo'],
        category_slug: 'aplicacao-pratica',
        post_type: 'aplicacao_pratica'
      }
    ];

    const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY');
    if (!NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY not configured');
    }

    // Search in Notion workspace
    async function notionSearch(query: string, pageSize = 50) {
      const resp = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          page_size: pageSize
        })
      });
      if (!resp.ok) {
        console.log(`Notion search failed for "${query}": ${resp.status}`);
        return [] as any[];
      }
      const data = await resp.json();
      return data.results || [];
    }

    // Fetch children blocks (one level)
    async function getPageBlocks(id: string) {
      const res = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    }

    // Query a database to get page entries
    async function queryDatabase(id: string) {
      const res = await fetch(`https://api.notion.com/v1/databases/${id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page_size: 100 })
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    }

    // Convert basic blocks to HTML (simple subset)
    function blocksToHtml(blocks: any[]): string {
      let html = '';
      for (const block of blocks) {
        switch (block.type) {
          case 'heading_1':
            if (block.heading_1.rich_text?.length) html += `<h1>${block.heading_1.rich_text[0].plain_text}</h1>\n`;
            break;
          case 'heading_2':
            if (block.heading_2.rich_text?.length) html += `<h2>${block.heading_2.rich_text[0].plain_text}</h2>\n`;
            break;
          case 'heading_3':
            if (block.heading_3.rich_text?.length) html += `<h3>${block.heading_3.rich_text[0].plain_text}</h3>\n`;
            break;
          case 'paragraph': {
            const text = (block.paragraph.rich_text || []).map((t: any) => t.plain_text).join('');
            if (text) html += `<p>${text}</p>\n`;
            break;
          }
          case 'bulleted_list_item': {
            const text = (block.bulleted_list_item.rich_text || []).map((t: any) => t.plain_text).join('');
            if (text) html += `<li>${text}</li>\n`;
            break;
          }
          case 'numbered_list_item': {
            const text = (block.numbered_list_item.rich_text || []).map((t: any) => t.plain_text).join('');
            if (text) html += `<li>${text}</li>\n`;
            break;
          }
          case 'quote': {
            const text = (block.quote.rich_text || []).map((t: any) => t.plain_text).join('');
            if (text) html += `<blockquote><p>${text}</p></blockquote>\n`;
            break;
          }
          case 'code': {
            const text = (block.code.rich_text || []).map((t: any) => t.plain_text).join('');
            html += `<pre><code>${text}</code></pre>\n`;
            break;
          }
        }
      }
      return html.trim();
    }

    function createSlug(title: string): string {
      return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    function extractTitleFromProperties(page: any): string {
      const p = page.properties || {};
      const titleProp: any = Object.values(p).find((prop: any) => prop?.type === 'title');
      if (titleProp?.title?.length) return titleProp.title[0].plain_text;
      if (p.Name?.title?.length) return p.Name.title[0].plain_text;
      if (page.child_page?.title) return page.child_page.title;
      return 'Artigo sem título';
    }

    // Helper: process a hub page (scan child_page, child_database, link_to_page, link_to_database)
    async function processHub(hubId: string, defaultMapping: any, wikiContents: WikiContent[]) {
      const children = await getPageBlocks(hubId);
      const candidates = children.filter((b: any) =>
        b.type === 'child_page' ||
        b.type === 'child_database' ||
        b.type === 'link_to_page'
      );
      console.log(`Hub ${hubId} candidates: ${candidates.length}`);

      for (const child of candidates) {
        try {
          if (child.type === 'child_page') {
            const title = child.child_page?.title || 'Artigo sem título';
            const blocks = await getPageBlocks(child.id);
            const html = blocksToHtml(blocks);
            if (!html || html.length < 50) continue;
            
            const excerpt = html.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
            const contentType = determineContentType(title, html);
            
            wikiContents.push({
              title,
              slug: createSlug(title),
              content: html,
              excerpt,
              post_type: contentType.post_type as 'conteudo' | 'como_fazer' | 'aplicacao_pratica',
              category_slug: contentType.category_slug
            });
            console.log(`Prepared from child page: "${title}" -> ${contentType.category_slug}`);
          } else if (child.type === 'child_database') {
            const entries = await queryDatabase(child.id);
            console.log(`Child DB ${child.id} entries: ${entries.length}`);
            for (const entry of entries) {
              const title = extractTitleFromProperties(entry);
              const blocks = await getPageBlocks(entry.id);
              const html = blocksToHtml(blocks);
              if (!html || html.length < 50) continue;
              
              const excerpt = html.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
              const contentType = determineContentType(title, html);
              
              wikiContents.push({
                title,
                slug: createSlug(title),
                content: html,
                excerpt,
                post_type: contentType.post_type as 'conteudo' | 'como_fazer' | 'aplicacao_pratica',
                category_slug: contentType.category_slug
              });
              console.log(`Prepared from child DB entry: "${title}" -> ${contentType.category_slug}`);
            }
          } else if (child.type === 'link_to_page') {
            const lt = child.link_to_page;
            if (lt?.type === 'page_id' && lt.page_id) {
              const details = await getPageBlocks(lt.page_id);
              const html = blocksToHtml(details);
              const title = child.child_page?.title || 'Artigo do Notion';
              if (!html || html.length < 50) continue;
              
              const excerpt = html.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
              const contentType = determineContentType(title, html);
              
              wikiContents.push({
                title,
                slug: createSlug(title),
                content: html,
                excerpt,
                post_type: contentType.post_type as 'conteudo' | 'como_fazer' | 'aplicacao_pratica',
                category_slug: contentType.category_slug
              });
              console.log(`Prepared from linked page: "${title}" -> ${contentType.category_slug}`);
            } else if (lt?.type === 'database_id' && lt.database_id) {
              const entries = await queryDatabase(lt.database_id);
              console.log(`Linked DB ${lt.database_id} entries: ${entries.length}`);
              for (const entry of entries) {
                const title = extractTitleFromProperties(entry);
                const blocks = await getPageBlocks(entry.id);
                const html = blocksToHtml(blocks);
                if (!html || html.length < 50) continue;
                
                const excerpt = html.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
                const contentType = determineContentType(title, html);
                
                wikiContents.push({
                  title,
                  slug: createSlug(title),
                  content: html,
                  excerpt,
                  post_type: contentType.post_type as 'conteudo' | 'como_fazer' | 'aplicacao_pratica',
                  category_slug: contentType.category_slug
                });
                console.log(`Prepared from linked DB entry: "${title}" -> ${contentType.category_slug}`);
              }
            }
          }
        } catch (err) {
          console.log('Error processing hub child:', err);
        }
      }
    }

    // Function to determine content type based on title and content
    function determineContentType(title: string, content: string): { category_slug: string; post_type: string } {
      const titleLower = title.toLowerCase();
      const contentLower = content.toLowerCase();
      
      for (const mapping of contentTypeMapping) {
        if (mapping.keywords.some(keyword => 
          titleLower.includes(keyword) || contentLower.includes(keyword)
        )) {
          return {
            category_slug: mapping.category_slug,
            post_type: mapping.post_type
          };
        }
      }
      
      // Default to conteudo if no match found
      return {
        category_slug: 'conteudos',
        post_type: 'conteudo'
      };
    }

    const wikiContents: WikiContent[] = [];

    console.log(`Fetching content from main database: ${MAIN_DATABASE_ID}`);
    
    try {
      // First try to get the page as a database
      const entries = await queryDatabase(MAIN_DATABASE_ID);
      console.log(`Database entries found: ${entries.length}`);
      
      for (const entry of entries) {
        const title = extractTitleFromProperties(entry);
        const blocks = await getPageBlocks(entry.id);
        const html = blocksToHtml(blocks);
        
        if (!html || html.length < 50) {
          console.log(`Skipping "${title}" - insufficient content`);
          continue;
        }
        
        const excerpt = html.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
        const contentType = determineContentType(title, html);
        
        wikiContents.push({
          title,
          slug: createSlug(title),
          content: html,
          excerpt,
          post_type: contentType.post_type as 'conteudo' | 'como_fazer' | 'aplicacao_pratica',
          category_slug: contentType.category_slug
        });
        
        console.log(`Prepared from database entry: "${title}" -> ${contentType.category_slug}`);
      }
      
      // If no database entries, try as a page with children
      if (entries.length === 0) {
        console.log('No database entries found, trying as page with children...');
        await processHub(MAIN_DATABASE_ID, {
          category_slug: 'conteudos', // default, will be overridden by content analysis
          post_type: 'conteudo'
        }, wikiContents);
      }
      
    } catch (error) {
      console.error('Error fetching from main database:', error);
      
      // Fallback: try to process as a regular page
      console.log('Fallback: trying to process as regular page...');
      try {
        await processHub(MAIN_DATABASE_ID, {
          category_slug: 'conteudos',
          post_type: 'conteudo'
        }, wikiContents);
      } catch (fallbackError) {
        console.error('Fallback processing failed:', fallbackError);
      }
    }

    console.log(`Total articles prepared for import: ${wikiContents.length}`);

    // Get existing categories
    const { data: categories, error: categoriesError } = await supabase
      .from('wiki_categories')
      .select('id, slug');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    console.log('Found categories:', categories?.length || 0);
    if (categories) {
      categories.forEach(cat => console.log(`- ${cat.slug}: ${cat.id}`));
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const content of wikiContents) {
      try {
        console.log(`Processing "${content.title}"...`);
        
        // Check if content already exists
        const { data: existingPost, error: checkError } = await supabase
          .from('wiki_posts')
          .select('id')
          .eq('slug', content.slug)
          .maybeSingle();

        if (checkError) {
          console.error(`Error checking existing post "${content.title}":`, checkError);
          continue;
        }

        if (existingPost) {
          console.log(`Skipping "${content.title}" - already exists`);
          skippedCount++;
          continue;
        }

        // Find category ID
        const category = categories?.find(cat => cat.slug === content.category_slug);
        console.log(`Category for "${content.title}": ${content.category_slug} -> ${category?.id || 'NOT FOUND'}`);
        
        // Prepare insert data
        const insertData = {
          title: content.title,
          slug: content.slug,
          content: content.content,
          excerpt: content.excerpt,
          post_type: content.post_type,
          category_id: category?.id || null,
          author_id: author_id,
          is_published: true,
          published_at: new Date().toISOString()
        };

        console.log(`Inserting "${content.title}"...`);

        const { data: insertedPost, error: insertError } = await supabase
          .from('wiki_posts')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.error(`Error inserting "${content.title}":`, insertError);
          continue;
        }

        console.log(`✅ Successfully imported: "${content.title}" with ID: ${insertedPost.id}`);
        importedCount++;

      } catch (error) {
        console.error(`❌ Error processing "${content.title}":`, error);
      }
    }

    const response = {
      success: true,
      message: `Import completed! Imported: ${importedCount}, Skipped: ${skippedCount}`,
      imported: importedCount,
      skipped: skippedCount
    };

    console.log('Final result:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});