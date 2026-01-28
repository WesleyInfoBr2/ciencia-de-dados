-- Reset all items to not featured
UPDATE public.library_items SET is_featured = false;

-- Set the 24 specific items as featured
UPDATE public.library_items SET is_featured = true WHERE name IN (
  'PyCaret (PyCaret)',
  'XGBoost (XGBoost)',
  'tidyr (R Studio)',
  'ggplot2 (Tidyverse)',
  'tidyverse (Tidyverse)',
  'IBM SPSS',
  'MATLAB',
  'Orange Data Mining',
  'STATISTICA',
  'Introdução a Ciência de Dados usando Python (1de3) (inglês)',
  'Modelagem de Dados',
  'Probabilidade e Estatística',
  'Python Fundamentos para Análise de Dados',
  'Inteligência Artificial Fundamentos',
  'IPEADATA',
  'IBGE',
  'Kaggle',
  'Portal Brasileiro de Dados Abertos',
  'Relação entre a escolaridade e o consumo de bebidas e drogas',
  'Levantamento sobre o perfil Social do Desemprego',
  'Perfil das vítimas de violência contra mulher no Brasil',
  'Levantamento estrutura prisional no Brasil',
  'Participação da população economicamente ativa referente a desigualdade de gênero',
  'Composição do CPC dos cursos do Brasil em 2014'
);