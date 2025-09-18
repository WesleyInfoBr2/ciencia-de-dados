-- Insert sample wiki posts to test the functionality
-- First, let's create a system user if profiles table is empty
INSERT INTO profiles (id, email, full_name, username, bio) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'sistema@cienciadedados.org',
  'Sistema CiênciaDeDados.org',
  'sistema',
  'Usuário do sistema para conteúdo importado'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Insert sample wiki posts
INSERT INTO wiki_posts (title, slug, content, excerpt, author_id, post_type, category_id, is_published, published_at) VALUES
(
  'Introdução à Análise de Dados',
  'introducao-analise-dados',
  '# Introdução à Análise de Dados

A análise de dados é o processo de examinar, limpar e modelar dados com o objetivo de descobrir informações úteis, formar conclusões e apoiar a tomada de decisões.

## Conceitos Fundamentais

1. **Coleta de Dados**: Processo de reunir informações relevantes
2. **Limpeza de Dados**: Identificar e corrigir erros nos dados
3. **Análise Exploratória**: Examinar os dados para entender seus padrões
4. **Visualização**: Representar os dados de forma gráfica

## Ferramentas Essenciais

- Python: pandas, numpy, matplotlib
- R: dplyr, ggplot2, tidyr
- SQL: para consultas em bancos de dados
- Excel: para análises básicas

A análise de dados é fundamental para a tomada de decisões baseada em evidências.',
  'Conceitos fundamentais da análise de dados para iniciantes, incluindo coleta, limpeza e visualização.',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'conteudo',
  (SELECT id FROM wiki_categories WHERE slug = 'conteudos' LIMIT 1),
  true,
  now()
),
(
  'Como Fazer Visualizações em Python',
  'como-fazer-visualizacoes-python',
  '# Como Fazer Visualizações em Python

Este tutorial mostra como criar visualizações eficazes usando Python.

## Bibliotecas Necessárias

```python
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
```

## Gráfico de Barras

```python
# Dados de exemplo
categorias = [''A'', ''B'', ''C'', ''D'']
valores = [23, 45, 56, 78]

# Criar gráfico
plt.figure(figsize=(8, 6))
plt.bar(categorias, valores)
plt.title(''Exemplo de Gráfico de Barras'')
plt.xlabel(''Categorias'')
plt.ylabel(''Valores'')
plt.show()
```

## Gráfico de Dispersão

```python
# Dados aleatórios
x = np.random.randn(100)
y = 2 * x + np.random.randn(100)

# Criar gráfico
plt.figure(figsize=(8, 6))
plt.scatter(x, y, alpha=0.6)
plt.title(''Gráfico de Dispersão'')
plt.xlabel(''Variável X'')
plt.ylabel(''Variável Y'')
plt.show()
```

## Dicas Importantes

1. Sempre adicione títulos e rótulos
2. Escolha cores apropriadas
3. Mantenha os gráficos simples e limpos
4. Considere o público-alvo',
  'Tutorial passo a passo para criar visualizações de dados usando matplotlib e seaborn.',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'como_fazer',
  (SELECT id FROM wiki_categories WHERE slug = 'como-fazer' LIMIT 1),
  true,
  now()
),
(
  'Análise de Vendas com Machine Learning',
  'analise-vendas-machine-learning',
  '# Análise de Vendas com Machine Learning

Este case study mostra como aplicar machine learning para prever vendas futuras.

## Contexto do Problema

Uma empresa de varejo queria prever as vendas mensais para otimizar o estoque e planejamento.

## Dados Disponíveis

- Histórico de vendas (24 meses)
- Dados sazonais
- Campanhas de marketing
- Dados econômicos

## Metodologia Aplicada

### 1. Análise Exploratória

```python
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

# Carregar dados
dados = pd.read_csv(''vendas.csv'')

# Análise inicial
print(dados.describe())
print(dados.info())
```

### 2. Feature Engineering

- Criação de variáveis sazonais
- Lag features das vendas anteriores
- Indicadores de campanhas de marketing

### 3. Modelagem

```python
# Preparar dados
X = dados[[''mes'', ''campanha'', ''vendas_anterior'']]
y = dados[''vendas'']

# Treinar modelo
modelo = RandomForestRegressor(n_estimators=100)
modelo.fit(X, y)

# Fazer previsões
previsoes = modelo.predict(X_test)
```

## Resultados

- **MAE**: 8.5% 
- **Precisão**: 91.5%
- **Economia**: R$ 500.000 em custos de estoque

## Conclusões

O modelo de machine learning permitiu:
1. Reduzir custos de estoque
2. Melhorar o planejamento
3. Aumentar a satisfação do cliente

Esta aplicação demonstra o valor prático do machine learning em problemas de negócio.',
  'Caso prático de aplicação de algoritmos de machine learning para prever vendas e otimizar estoque.',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'aplicacao_pratica',
  (SELECT id FROM wiki_categories WHERE slug = 'aplicacao-pratica' LIMIT 1),
  true,
  now()
),
(
  'Fundamentos de Estatística para Data Science',
  'fundamentos-estatistica-data-science',
  '# Fundamentos de Estatística para Data Science

A estatística é a base fundamental para qualquer análise de dados séria.

## Conceitos Básicos

### Medidas de Tendência Central
- **Média**: Soma dos valores dividida pelo número de observações
- **Mediana**: Valor central quando os dados estão ordenados
- **Moda**: Valor que aparece com maior frequência

### Medidas de Dispersão
- **Variância**: Média dos quadrados das diferenças em relação à média
- **Desvio Padrão**: Raiz quadrada da variância
- **Amplitude**: Diferença entre o maior e menor valor

## Distribuições de Probabilidade

### Distribuição Normal
A mais importante em estatística, caracterizada por:
- Formato de sino
- Simétrica em relação à média
- 68% dos dados entre μ ± σ

### Outras Distribuições Importantes
- **Binomial**: Para variáveis discretas
- **Poisson**: Para eventos raros
- **Chi-quadrado**: Para testes de independência

## Testes de Hipóteses

1. **Formulação das hipóteses**
2. **Escolha do nível de significância**
3. **Cálculo da estatística de teste**
4. **Tomada de decisão**

A estatística fornece as ferramentas necessárias para fazer inferências válidas a partir dos dados.',
  'Conceitos fundamentais de estatística essenciais para profissionais de data science.',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'conteudo',
  (SELECT id FROM wiki_categories WHERE slug = 'conteudos' LIMIT 1),
  true,
  now()
),
(
  'Como Implementar um Pipeline de ETL',
  'como-implementar-pipeline-etl',
  '# Como Implementar um Pipeline de ETL

ETL (Extract, Transform, Load) é fundamental para preparar dados para análise.

## Estrutura do Pipeline

### 1. Extract (Extração)

```python
import pandas as pd
import sqlite3

# Conectar ao banco
conn = sqlite3.connect(''dados.db'')

# Extrair dados
query = "SELECT * FROM vendas WHERE data >= ''2024-01-01''"
dados = pd.read_sql(query, conn)
```

### 2. Transform (Transformação)

```python
# Limpeza dos dados
dados = dados.dropna()
dados[''valor''] = dados[''valor''].astype(float)

# Criar novas variáveis
dados[''mes''] = pd.to_datetime(dados[''data'']).dt.month
dados[''categoria_valor''] = dados[''valor''].apply(
    lambda x: ''alto'' if x > 1000 else ''baixo''
)

# Agregações
vendas_mensais = dados.groupby(''mes'')[''valor''].sum()
```

### 3. Load (Carregamento)

```python
# Salvar dados processados
dados.to_csv(''dados_processados.csv'', index=False)

# Ou carregar em banco
dados.to_sql(''vendas_processadas'', conn, if_exists=''replace'')
```

## Boas Práticas

1. **Validação de dados** em cada etapa
2. **Logging** para rastrear o processo
3. **Tratamento de erros** robusto
4. **Documentação** clara
5. **Testes automatizados**

## Ferramentas Recomendadas

- **Apache Airflow**: Orquestração
- **Pandas**: Transformações
- **SQLAlchemy**: Conexões de banco
- **Great Expectations**: Validação de dados

Um pipeline bem estruturado é essencial para análises confiáveis.',
  'Guia completo para implementar pipelines de ETL eficientes e robustos.',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'como_fazer',
  (SELECT id FROM wiki_categories WHERE slug = 'como-fazer' LIMIT 1),
  true,
  now()
);