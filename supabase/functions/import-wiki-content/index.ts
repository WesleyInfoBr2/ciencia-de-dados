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

    // Mapping Notion pages to categories
    const notionPages = [
      { 
        url: 'https://cienciadedados.notion.site/conceitos',
        category_slug: 'conteudos',
        post_type: 'conteudo'
      },
      { 
        url: 'https://cienciadedados.notion.site/como-fazer',
        category_slug: 'como-fazer', 
        post_type: 'como_fazer'
      },
      { 
        url: 'https://cienciadedados.notion.site/aplicacoes',
        category_slug: 'aplicacao-pratica',
        post_type: 'aplicacao_pratica' 
      }
    ];

    const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY');
    if (!NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY not configured');
    }

    // Function to extract page ID from Notion URL
    function extractPageId(url: string): string {
      const match = url.match(/([a-f0-9]{32})|([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
      if (match) {
        return match[0].replace(/-/g, '');
      }
      
      // Try to extract from the end of URL
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const cleanPart = lastPart.split('?')[0].split('#')[0];
      
      // If it contains a dash, it might be a page ID
      const dashMatch = cleanPart.match(/([a-f0-9]{32})/);
      return dashMatch ? dashMatch[0] : cleanPart;
    }

    // Function to fetch Notion page content
    async function searchNotionDatabase(pageId: string) {
      try {
        console.log(`Searching for database in Notion page: ${pageId}`);
        
        // First, try to get the page as a database
        const dbResponse = await fetch(`https://api.notion.com/v1/databases/${pageId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });

        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          console.log(`Found database with ${dbData.results?.length || 0} pages`);
          return { type: 'database', data: dbData.results };
        }

        // If it's not a database, try to get it as a page and search for child pages
        const pageResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
          },
        });

        if (pageResponse.ok) {
          const pageData = await pageResponse.json();
          console.log(`Found page with ${pageData.results?.length || 0} blocks`);
          
          // Look for child pages in the blocks
          const childPages = pageData.results?.filter((block: any) => 
            block.type === 'child_page' || block.type === 'child_database'
          ) || [];
          
          console.log(`Found ${childPages.length} child pages`);
          return { type: 'page', data: childPages };
        }

        console.log(`Failed to fetch page/database ${pageId}: ${pageResponse.status}`);
        return null;

      } catch (error) {
        console.error(`Error fetching Notion content for ${pageId}:`, error);
        return null;
      }
    }

    // Function to get page details
    async function getPageDetails(pageId: string) {
      try {
        const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
          },
        });

        if (response.ok) {
          return await response.json();
        }
        return null;
      } catch (error) {
        console.error(`Error getting page details for ${pageId}:`, error);
        return null;
      }
    }

    // Function to get page content
    async function getPageContent(pageId: string) {
      try {
        const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.results;
        }
        return [];
      } catch (error) {
        console.error(`Error getting page content for ${pageId}:`, error);
        return [];
      }
    }

    // Function to convert Notion blocks to HTML
    function blocksToHtml(blocks: any[]): string {
      let html = '';
      
      for (const block of blocks) {
        switch (block.type) {
          case 'heading_1':
            if (block.heading_1.rich_text?.length > 0) {
              html += `<h1>${block.heading_1.rich_text[0].plain_text}</h1>\n`;
            }
            break;
          case 'heading_2':
            if (block.heading_2.rich_text?.length > 0) {
              html += `<h2>${block.heading_2.rich_text[0].plain_text}</h2>\n`;
            }
            break;
          case 'heading_3':
            if (block.heading_3.rich_text?.length > 0) {
              html += `<h3>${block.heading_3.rich_text[0].plain_text}</h3>\n`;
            }
            break;
          case 'paragraph':
            if (block.paragraph.rich_text?.length > 0) {
              const text = block.paragraph.rich_text
                .map((t: any) => t.plain_text)
                .join('');
              html += `<p>${text}</p>\n`;
            }
            break;
          case 'bulleted_list_item':
            if (block.bulleted_list_item.rich_text?.length > 0) {
              const text = block.bulleted_list_item.rich_text
                .map((t: any) => t.plain_text)
                .join('');
              html += `<li>${text}</li>\n`;
            }
            break;
          case 'numbered_list_item':
            if (block.numbered_list_item.rich_text?.length > 0) {
              const text = block.numbered_list_item.rich_text
                .map((t: any) => t.plain_text)
                .join('');
              html += `<li>${text}</li>\n`;
            }
            break;
          case 'code':
            if (block.code.rich_text?.length > 0) {
              const text = block.code.rich_text
                .map((t: any) => t.plain_text)
                .join('');
              html += `<pre><code>${text}</code></pre>\n`;
            }
            break;
          case 'quote':
            if (block.quote.rich_text?.length > 0) {
              const text = block.quote.rich_text
                .map((t: any) => t.plain_text)
                .join('');
              html += `<blockquote><p>${text}</p></blockquote>\n`;
            }
            break;
        }
      }
      
      return html.trim();
    }

    // Function to create slug from title
    function createSlug(title: string): string {
      return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    // Function to extract title from page properties
    function extractTitle(page: any): string {
      if (page.properties) {
        // Look for title property
        const titleProp = Object.values(page.properties).find((prop: any) => prop.type === 'title');
        if (titleProp && (titleProp as any).title?.length > 0) {
          return (titleProp as any).title[0].plain_text;
        }

        // Look for Name property (common in databases)
        if (page.properties.Name && page.properties.Name.title?.length > 0) {
          return page.properties.Name.title[0].plain_text;
        }
      }

      // Fallback to child_page title
      if (page.child_page) {
        return page.child_page.title;
      }

      return 'Artigo sem título';
    }

    // Import content from Notion pages
    const wikiContents: WikiContent[] = [];
    
    for (const notionPage of notionPages) {
      console.log(`Processing Notion page: ${notionPage.url}`);
      
      const pageId = extractPageId(notionPage.url);
      console.log(`Extracted page ID: ${pageId}`);
      
      if (!pageId) {
        console.log(`Could not extract page ID from URL: ${notionPage.url}`);
        continue;
      }

      const searchResult = await searchNotionDatabase(pageId);
      if (!searchResult) {
        console.log(`Failed to fetch data for page: ${notionPage.url}`);
        continue;
      }

      if (searchResult.type === 'database' && searchResult.data) {
        // Process database pages
        for (const page of searchResult.data) {
          const title = extractTitle(page);
          const content = await getPageContent(page.id);
          const htmlContent = blocksToHtml(content);
          
          if (htmlContent.length > 0) {
            const excerpt = htmlContent.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
            
            wikiContents.push({
              title,
              slug: createSlug(title),
              content: htmlContent,
              excerpt,
              post_type: notionPage.post_type,
              category_slug: notionPage.category_slug
            });

            console.log(`✅ Processed database page: "${title}" (${htmlContent.length} chars)`);
          }
        }
      } else if (searchResult.type === 'page' && searchResult.data) {
        // Process child pages
        for (const childPage of searchResult.data) {
          const title = childPage.child_page?.title || 'Artigo sem título';
          const content = await getPageContent(childPage.id);
          const htmlContent = blocksToHtml(content);
          
          if (htmlContent.length > 0) {
            const excerpt = htmlContent.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
            
            wikiContents.push({
              title,
              slug: createSlug(title),
              content: htmlContent,
              excerpt,
              post_type: notionPage.post_type,
              category_slug: notionPage.category_slug
            });

            console.log(`✅ Processed child page: "${title}" (${htmlContent.length} chars)`);
          }
        }
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