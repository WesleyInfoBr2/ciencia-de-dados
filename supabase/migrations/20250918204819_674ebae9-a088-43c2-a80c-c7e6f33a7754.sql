-- Insert sample wiki posts using existing user or create a simple approach
-- Let's first check if we have any existing users, if not, we'll create posts without specific authors for now

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
  (SELECT id FROM profiles LIMIT 1),
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
categorias = ["A", "B", "C", "D"]
valores = [23, 45, 56, 78]

# Criar gráfico
plt.figure(figsize=(8, 6))
plt.bar(categorias, valores)
plt.title("Exemplo de Gráfico de Barras")
plt.xlabel("Categorias")
plt.ylabel("Valores")
plt.show()
```

## Dicas Importantes

1. Sempre adicione títulos e rótulos
2. Escolha cores apropriadas
3. Mantenha os gráficos simples e limpos
4. Considere o público-alvo',
  'Tutorial passo a passo para criar visualizações de dados usando matplotlib e seaborn.',
  (SELECT id FROM profiles LIMIT 1),
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

## Metodologia Aplicada

### 1. Análise Exploratória

```python
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor

# Carregar dados
dados = pd.read_csv("vendas.csv")

# Análise inicial
print(dados.describe())
```

### 2. Modelagem

```python
# Preparar dados
X = dados[["mes", "campanha", "vendas_anterior"]]
y = dados["vendas"]

# Treinar modelo
modelo = RandomForestRegressor(n_estimators=100)
modelo.fit(X, y)
```

## Resultados

- **Precisão**: 91.5%
- **Economia**: R$ 500.000 em custos de estoque

Esta aplicação demonstra o valor prático do machine learning em problemas de negócio.',
  'Caso prático de aplicação de algoritmos de machine learning para prever vendas e otimizar estoque.',
  (SELECT id FROM profiles LIMIT 1),
  'aplicacao_pratica',
  (SELECT id FROM wiki_categories WHERE slug = 'aplicacao-pratica' LIMIT 1),
  true,
  now()
);