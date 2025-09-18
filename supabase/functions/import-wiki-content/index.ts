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

    // Sample content based on the Notion site structure
    const wikiContents: WikiContent[] = [
      {
        title: "Introdução à Ciência de Dados",
        slug: "introducao-ciencia-dados",
        content: `
          <h1>Introdução à Ciência de Dados</h1>
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
          </ol>

          <h2>Ferramentas Essenciais</h2>
          <p>As principais ferramentas utilizadas em ciência de dados incluem:</p>
          
          <h3>Linguagens de Programação</h3>
          <ul>
            <li><strong>Python:</strong> Versatilidade e ecossistema rico</li>
            <li><strong>R:</strong> Especializada em estatística</li>
            <li><strong>SQL:</strong> Manipulação de dados relacionais</li>
          </ul>

          <h3>Bibliotecas Python</h3>
          <pre><code># Principais bibliotecas para Data Science
import pandas as pd          # Manipulação de dados
import numpy as np           # Computação numérica
import matplotlib.pyplot as plt  # Visualização
import seaborn as sns        # Visualização estatística
import scikit-learn         # Machine Learning</code></pre>
        `,
        excerpt: "Uma introdução completa ao campo da ciência de dados, suas áreas de aplicação e processo metodológico.",
        post_type: "conteudo",
        category_slug: "conteudos"
      },
      {
        title: "Como configurar ambiente Python para Data Science",
        slug: "configurar-ambiente-python-data-science",
        content: `
          <h1>Como configurar ambiente Python para Data Science</h1>
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

          <h2>Passo 4: Configurar Jupyter</h2>
          <pre><code># Iniciar Jupyter Notebook
jupyter notebook</code></pre>

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
plt.show()</code></pre>
        `,
        excerpt: "Guia passo a passo para configurar um ambiente Python completo para ciência de dados.",
        post_type: "como_fazer",
        category_slug: "como-fazer"
      },
      {
        title: "Análise de Vendas com Python - Estudo de Caso",
        slug: "analise-vendas-python-estudo-caso",
        content: `
          <h1>Análise de Vendas com Python - Estudo de Caso</h1>
          <p>Neste estudo de caso, vamos analisar dados de vendas de uma empresa fictícia usando Python.</p>

          <h2>Contexto do Problema</h2>
          <p>A empresa XYZ quer entender:</p>
          <ul>
            <li>Quais produtos vendem mais</li>
            <li>Sazonalidade nas vendas</li>
            <li>Perfil dos clientes</li>
            <li>Previsão de vendas futuras</li>
          </ul>

          <h2>Dataset</h2>
          <p>Utilizamos um dataset com as seguintes colunas:</p>
          <ul>
            <li><strong>data:</strong> Data da venda</li>
            <li><strong>produto:</strong> Nome do produto</li>
            <li><strong>categoria:</strong> Categoria do produto</li>
            <li><strong>valor:</strong> Valor da venda</li>
            <li><strong>cliente_id:</strong> ID do cliente</li>
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
          </ul>

          <h2>Modelo Preditivo</h2>
          <pre><code>from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

# Preparar dados para previsão
X = df[['mes', 'categoria_encoded']]
y = df['valor']

# Treinar modelo
model = LinearRegression()
model.fit(X, y)

# Fazer previsões
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
print(f'Erro médio: R$ {mae:.2f}')</code></pre>
        `,
        excerpt: "Estudo de caso completo de análise de vendas usando Python, pandas e scikit-learn.",
        post_type: "aplicacao_pratica",
        category_slug: "aplicacao-pratica"
      },
      {
        title: "Pandas: Manipulação de Dados em Python",
        slug: "pandas-manipulacao-dados-python",
        content: `
          <h1>Pandas: Manipulação de Dados em Python</h1>
          <p>Pandas é a biblioteca mais importante para manipulação de dados em Python. Este guia cobre os conceitos essenciais.</p>

          <h2>O que é Pandas?</h2>
          <p>Pandas é uma biblioteca que fornece estruturas de dados e ferramentas de análise para Python:</p>
          <ul>
            <li><strong>DataFrame:</strong> Tabela bidimensional</li>
            <li><strong>Series:</strong> Array unidimensional</li>
            <li><strong>Operações:</strong> Filtragem, agrupamento, junção</li>
          </ul>

          <h2>Instalação</h2>
          <pre><code>pip install pandas</code></pre>

          <h2>Estruturas Básicas</h2>
          
          <h3>Series</h3>
          <pre><code>import pandas as pd

# Criar Series
s = pd.Series([1, 2, 3, 4, 5])
print(s)

# Series com índice personalizado
s = pd.Series([1, 2, 3], index=['a', 'b', 'c'])
print(s)</code></pre>

          <h3>DataFrame</h3>
          <pre><code># Criar DataFrame
data = {
    'nome': ['João', 'Maria', 'Pedro'],
    'idade': [25, 30, 35],
    'cidade': ['SP', 'RJ', 'BH']
}
df = pd.DataFrame(data)
print(df)</code></pre>

          <h2>Operações Essenciais</h2>
          
          <h3>Seleção de Dados</h3>
          <pre><code># Selecionar coluna
df['nome']

# Selecionar múltiplas colunas
df[['nome', 'idade']]

# Filtrar linhas
df[df['idade'] > 30]</code></pre>

          <h3>Agrupamento</h3>
          <pre><code># Agrupar por cidade
df.groupby('cidade')['idade'].mean()</code></pre>

          <h3>Estatísticas</h3>
          <pre><code># Estatísticas descritivas
df.describe()

# Informações do DataFrame
df.info()</code></pre>

          <h2>Leitura de Arquivos</h2>
          <pre><code># CSV
df = pd.read_csv('arquivo.csv')

# Excel
df = pd.read_excel('arquivo.xlsx')

# JSON
df = pd.read_json('arquivo.json')</code></pre>
        `,
        excerpt: "Guia completo sobre a biblioteca Pandas para manipulação e análise de dados em Python.",
        post_type: "conteudo",
        category_slug: "bibliotecas"
      },
      {
        title: "Introdução ao Machine Learning",
        slug: "introducao-machine-learning",
        content: `
          <h1>Introdução ao Machine Learning</h1>
          <p>Machine Learning (ML) é um subcampo da inteligência artificial que permite aos computadores <strong>aprender sem serem explicitamente programados</strong> para cada tarefa específica.</p>

          <h2>Tipos de Machine Learning</h2>
          
          <h3>1. Aprendizado Supervisionado</h3>
          <p>O algoritmo aprende com dados rotulados, onde temos pares de entrada-saída:</p>
          <ul>
            <li><strong>Classificação:</strong> Prever categorias discretas (spam/não spam, gato/cachorro)</li>
            <li><strong>Regressão:</strong> Prever valores contínuos (preços, temperaturas)</li>
          </ul>

          <h3>2. Aprendizado Não Supervisionado</h3>
          <p>O algoritmo encontra padrões em dados não rotulados:</p>
          <ul>
            <li><strong>Clustering:</strong> Agrupar dados similares (segmentação de clientes)</li>
            <li><strong>Redução de dimensionalidade:</strong> Simplificar dados mantendo informações importantes</li>
            <li><strong>Detecção de anomalias:</strong> Identificar padrões incomuns</li>
          </ul>

          <h3>3. Aprendizado por Reforço</h3>
          <p>O algoritmo aprende através de tentativa e erro, recebendo recompensas ou penalidades:</p>
          <ul>
            <li>Jogos (AlphaGo, xadrez)</li>
            <li>Robótica e navegação</li>
            <li>Sistemas de recomendação</li>
          </ul>

          <h2>Conceitos Fundamentais</h2>

          <h3>Função de Custo</h3>
          <p>Em regressão linear, minimizamos o erro quadrático médio:</p>
          <p><span class="ql-formula" data-value="J(\\theta) = \\frac{1}{2m} \\sum_{i=1}^{m} (h_\\theta(x^{(i)}) - y^{(i)})^2">J(θ) = ½m Σ(hθ(x⁽ⁱ⁾) - y⁽ⁱ⁾)²</span></p>
          
          <h3>Gradiente Descendente</h3>
          <p>Algoritmo de otimização para encontrar o mínimo da função de custo:</p>
          <p><span class="ql-formula" data-value="\\theta_j := \\theta_j - \\alpha \\frac{\\partial}{\\partial \\theta_j} J(\\theta)">θⱼ := θⱼ - α ∂J(θ)/∂θⱼ</span></p>
          
          <p>Onde <span class="ql-formula" data-value="\\alpha">α</span> é a taxa de aprendizado (learning rate).</p>

          <h2>Algoritmos Populares</h2>
          
          <h3>Para Classificação</h3>
          <ul>
            <li><strong>Regressão Logística:</strong> Simples e interpretável</li>
            <li><strong>Random Forest:</strong> Ensemble de árvores de decisão</li>
            <li><strong>SVM (Support Vector Machine):</strong> Eficaz para alta dimensionalidade</li>
            <li><strong>Redes Neurais:</strong> Modelos não-lineares complexos</li>
          </ul>

          <h3>Para Regressão</h3>
          <ul>
            <li><strong>Regressão Linear:</strong> Base para outros modelos</li>
            <li><strong>Ridge/Lasso:</strong> Regularização para prevenir overfitting</li>
            <li><strong>Gradient Boosting:</strong> Ensemble sequencial para alta performance</li>
          </ul>

          <h2>Métricas de Avaliação</h2>
          
          <h3>Para Classificação</h3>
          <ul>
            <li><strong>Acurácia:</strong> <span class="ql-formula" data-value="\\frac{VP + VN}{VP + VN + FP + FN}">Acurácia = (VP + VN)/(VP + VN + FP + FN)</span></li>
            <li><strong>Precisão:</strong> <span class="ql-formula" data-value="\\frac{VP}{VP + FP}">Precisão = VP/(VP + FP)</span></li>
            <li><strong>Recall:</strong> <span class="ql-formula" data-value="\\frac{VP}{VP + FN}">Recall = VP/(VP + FN)</span></li>
          </ul>

          <h3>Para Regressão</h3>
          <ul>
            <li><strong>MSE:</strong> <span class="ql-formula" data-value="\\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2">MSE = (1/n) Σ(yᵢ - ŷᵢ)²</span></li>
            <li><strong>MAE:</strong> <span class="ql-formula" data-value="\\frac{1}{n} \\sum_{i=1}^{n} |y_i - \\hat{y}_i|">MAE = (1/n) Σ|yᵢ - ŷᵢ|</span></li>
            <li><strong>R²:</strong> <span class="ql-formula" data-value="1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2}">R² = 1 - Σ(yᵢ - ŷᵢ)²/Σ(yᵢ - ȳ)²</span></li>
          </ul>

          <h2>Exemplo Prático</h2>
          <pre><code>from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# Dividir dados em treino e teste
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Treinar modelo
model = LogisticRegression(random_state=42)
model.fit(X_train, y_train)

# Fazer previsões
y_pred = model.predict(X_test)

# Avaliar performance
accuracy = accuracy_score(y_test, y_pred)
print(f'Acurácia: {accuracy:.3f}')
print('\\nRelatório detalhado:')
print(classification_report(y_test, y_pred))</code></pre>

          <blockquote>
            <p><strong>Dica:</strong> Sempre valide seus modelos com dados não vistos durante o treinamento para evitar overfitting!</p>
          </blockquote>
        `,
        excerpt: "Introdução completa ao Machine Learning: tipos, algoritmos, métricas e fórmulas matemáticas fundamentais.",
        post_type: "conteudo",
        category_slug: "conteudos"
      }
    ];

    // Get existing categories
    const { data: categories } = await supabase
      .from('wiki_categories')
      .select('id, slug');

    console.log('Found categories:', categories);

    let importedCount = 0;
    let skippedCount = 0;

    for (const content of wikiContents) {
      try {
        // Check if content already exists
        const { data: existingPost } = await supabase
          .from('wiki_posts')
          .select('id')
          .eq('slug', content.slug)
          .single();

        if (existingPost) {
          console.log(`Skipping "${content.title}" - already exists`);
          skippedCount++;
          continue;
        }

        // Find category ID
        const category = categories?.find(cat => cat.slug === content.category_slug);
        
        // Insert post
        const { error: insertError } = await supabase
          .from('wiki_posts')
          .insert({
            title: content.title,
            slug: content.slug,
            content: content.content,
            excerpt: content.excerpt,
            post_type: content.post_type,
            category_id: category?.id || null,
            author_id: author_id,
            is_published: true,
            published_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Error inserting "${content.title}":`, insertError);
          continue;
        }

        console.log(`Successfully imported: "${content.title}"`);
        importedCount++;

      } catch (error) {
        console.error(`Error processing "${content.title}":`, error);
      }
    }

    const response = {
      success: true,
      message: `Import completed! Imported: ${importedCount}, Skipped: ${skippedCount}`,
      imported: importedCount,
      skipped: skippedCount
    };

    console.log('Import completed:', response);

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