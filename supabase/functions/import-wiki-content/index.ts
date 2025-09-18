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

    // Sample content to import
    const wikiContents: WikiContent[] = [
      {
        title: "Introdução à Ciência de Dados",
        slug: "introducao-ciencia-dados",
        content: `<h1>Introdução à Ciência de Dados</h1>
<p>A ciência de dados é uma área interdisciplinar que utiliza métodos científicos, processos, algoritmos e sistemas para extrair <strong>conhecimento e insights</strong> de dados estruturados e não estruturados.</p>

<h2>O que é Ciência de Dados?</h2>
<p>Ciência de dados combina estatística, matemática, programação e conhecimento específico do domínio para:</p>
<ul>
<li>Coletar e limpar dados</li>
<li>Explorar e visualizar informações</li>
<li>Construir modelos preditivos</li>
<li>Comunicar insights de forma clara</li>
</ul>

<blockquote>
<p>"In God we trust. All others must bring data." - W. Edwards Deming</p>
</blockquote>

<h2>Áreas de Conhecimento</h2>
<p>A ciência de dados é uma intersecção entre três domínios principais:</p>
<ul>
<li><strong>Estatística e Matemática:</strong> Fundamentos para análise e modelagem</li>
<li><strong>Ciência da Computação:</strong> Programação e processamento de dados</li>
<li><strong>Expertise de Domínio:</strong> Conhecimento específico do negócio ou área</li>
</ul>

<h2>Processo de Ciência de Dados (CRISP-DM)</h2>
<ol>
<li><strong>Entendimento do Negócio:</strong> Definir objetivos e requisitos</li>
<li><strong>Entendimento dos Dados:</strong> Coleta e exploração inicial</li>
<li><strong>Preparação dos Dados:</strong> Limpeza e transformação</li>
<li><strong>Modelagem:</strong> Seleção e aplicação de técnicas</li>
<li><strong>Avaliação:</strong> Validação dos resultados</li>
<li><strong>Implementação:</strong> Deploy e monitoramento</li>
</ol>`,
        excerpt: "Uma introdução completa ao campo da ciência de dados, suas áreas de aplicação e processo metodológico.",
        post_type: "conteudo",
        category_slug: "conteudos"
      },
      {
        title: "Como configurar ambiente Python para Data Science",
        slug: "configurar-ambiente-python-data-science",
        content: `<h1>Como configurar ambiente Python para Data Science</h1>
<p>Este guia mostra como configurar um ambiente completo Python para ciência de dados.</p>

<h2>Pré-requisitos</h2>
<ul>
<li>Computador com Windows, macOS ou Linux</li>
<li>Conexão com internet</li>
<li>Conhecimentos básicos de linha de comando</li>
</ul>

<h2>Passo 1: Instalar Python</h2>
<p>Baixe Python da página oficial: <a href="https://python.org">python.org</a></p>
<pre><code># Verificar se Python está instalado
python --version</code></pre>

<h2>Passo 2: Instalar Anaconda</h2>
<p>Anaconda é uma distribuição Python que inclui muitas bibliotecas úteis:</p>
<ol>
<li>Baixe Anaconda do site oficial</li>
<li>Execute o instalador</li>
<li>Siga as instruções padrão</li>
</ol>

<h2>Passo 3: Bibliotecas Essenciais</h2>
<pre><code># Instalar bibliotecas principais
pip install pandas numpy matplotlib seaborn scikit-learn jupyter</code></pre>

<h2>Teste do Ambiente</h2>
<p>Crie um notebook e teste:</p>
<pre><code>import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Criar dados de exemplo
data = pd.DataFrame({
    'x': range(10),
    'y': np.random.randn(10)
})

# Visualizar
plt.plot(data['x'], data['y'])
plt.show()</code></pre>`,
        excerpt: "Guia passo a passo para configurar um ambiente Python completo para ciência de dados.",
        post_type: "como_fazer",
        category_slug: "como-fazer"
      },
      {
        title: "Análise de Vendas com Python - Estudo de Caso",
        slug: "analise-vendas-python-estudo-caso",
        content: `<h1>Análise de Vendas com Python - Estudo de Caso</h1>
<p>Neste estudo de caso, vamos analisar dados de vendas de uma empresa fictícia usando Python.</p>

<h2>Contexto do Problema</h2>
<p>A empresa XYZ quer entender:</p>
<ul>
<li>Quais produtos vendem mais</li>
<li>Sazonalidade nas vendas</li>
<li>Perfil dos clientes</li>
<li>Previsão de vendas futuras</li>
</ul>

<h2>Análise Exploratória</h2>
<pre><code>import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Carregar dados
df = pd.read_csv('vendas.csv')

# Estatísticas básicas
print(df.describe())

# Vendas por categoria
vendas_categoria = df.groupby('categoria')['valor'].sum()
vendas_categoria.plot(kind='bar')
plt.title('Vendas por Categoria')
plt.show()</code></pre>

<h2>Principais Insights</h2>
<ul>
<li>Eletrônicos representam 45% das vendas</li>
<li>Pico de vendas em dezembro</li>
<li>20% dos clientes geram 80% da receita</li>
<li>Tendência de crescimento de 15% ao ano</li>
</ul>`,
        excerpt: "Estudo de caso completo de análise de vendas usando Python, pandas e scikit-learn.",
        post_type: "aplicacao_pratica",
        category_slug: "aplicacao-pratica"
      }
    ];

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