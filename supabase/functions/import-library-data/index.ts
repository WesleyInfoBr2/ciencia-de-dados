import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface LibraryItemData {
  categoria: string;
  nome: string;
  descrição: string;
  website_url: string;
  Preço: string;
  tags: string;
  destaques: string;
  status: string;
  [key: string]: string | undefined;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapCategory(cat: string): string {
  const mapping: Record<string, string> = {
    'codes': 'codes',
    'tools': 'tools',
    'courses': 'courses',
    'sources': 'sources',
    'datasets': 'datasets',
  };
  return mapping[cat.toLowerCase()] || cat.toLowerCase();
}

function mapPrice(price: string): string {
  const p = price?.toLowerCase().trim() || 'free';
  if (p.includes('gratu') || p === 'free') return 'free';
  if (p.includes('pago') || p === 'paid') return 'paid';
  if (p.includes('freemium')) return 'freemium';
  if (p.includes('assin') || p.includes('subscr')) return 'subscription';
  return 'free';
}

function parseTags(tagsStr: string): string[] {
  if (!tagsStr) return [];
  return tagsStr
    .split(/[;,]/)
    .map(t => t.trim())
    .filter(Boolean);
}

function parseBoolean(val: string | undefined): boolean {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  return v === 'true' || v === 'sim' || v === 'yes' || v === '1';
}

function cleanUrl(url: string | undefined): string | null {
  if (!url) return null;
  // Remove escaped backslashes from markdown parsing
  return url.replace(/\\/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { items } = await req.json() as { items: LibraryItemData[] };

    if (!items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: 'Invalid items array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      inserted: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const item of items) {
      try {
        const category = mapCategory(item.categoria);
        const slug = slugify(item.nome);

        // Extract attributes from fields starting with 'atributo.'
        const attributes: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(item)) {
          if (key.startsWith('atributo.') && value) {
            const attrKey = key.replace('atributo.', '');
            // Handle boolean values
            if (attrKey === 'open_source' || attrKey === 'certificado') {
              attributes[attrKey] = parseBoolean(value);
            } else {
              attributes[attrKey] = value;
            }
          }
        }

        // Determine language for codes
        let language = null;
        if (category === 'codes' && attributes.linguagem) {
          language = String(attributes.linguagem);
          delete attributes.linguagem;
        }

        const libraryItem = {
          category,
          name: item.nome,
          short_description: item.descrição || null,
          website_url: cleanUrl(item.website_url),
          price: mapPrice(item.Preço),
          tags: parseTags(item.tags),
          is_featured: parseBoolean(item.destaques),
          status: item.status?.toLowerCase() === 'ativo' ? 'active' : 'inactive',
          slug,
          language,
          is_open_source: attributes.open_source as boolean || false,
          attributes,
        };

        // Check if item exists
        const { data: existing } = await supabase
          .from('library_items')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existing) {
          // Update
          const { error } = await supabase
            .from('library_items')
            .update(libraryItem)
            .eq('id', existing.id);

          if (error) throw error;
          results.updated++;
        } else {
          // Insert
          const { error } = await supabase
            .from('library_items')
            .insert(libraryItem);

          if (error) throw error;
          results.inserted++;
        }
      } catch (error) {
        results.errors.push(`Error processing ${item.nome}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
