-- Insert sample data to test the libraries functionality
INSERT INTO tools (name, description, category, is_free, is_online, status, website_url) VALUES
('TANAGRA', 'oferece uma interface GUI e métodos para acesso a dados, estatísticas, seleção de recursos, classificação, agrupamento, visualização, associação e muito mais.', 'Suites/Plataformas', true, false, 'active', 'http://chirouble.univ-lyon2.fr/~ricco/tanagra/index.html'),
('SPSS', 'Macros, scripts e outros complementos de Raynald Levesque.', 'Análise Estatística', false, false, 'active', 'http://pages.infinit.net/rlevesqu/index.htm'),
('XGBoost', 'É uma implementação da estrutura de aumento de gradiente. Ele suporta várias funções de objetivo, incluindo regressão e classificação.', 'Machine Learning', true, false, 'active', 'https://xgboost.readthedocs.io/en/latest/python/'),
('R Studio', 'Ambiente integrado de desenvolvimento para R', 'IDE', true, false, 'active', 'https://rstudio.com/'),
('Jupyter Notebook', 'Ambiente interativo para análise de dados e prototipagem', 'IDE', true, true, 'active', 'https://jupyter.org/');

INSERT INTO educational_courses (name, institution, duration, price, access_url, status) VALUES
('Python para Ciência de Dados', 'Cognitive Class', '3hs', 'Gratuito', 'https://cognitiveclass.ai/courses/python-for-data-science', 'active'),
('Introdução a Ciência de Dados', 'Cognitive Class', '3hs', 'Gratuito', 'https://cognitiveclass.ai/courses/data-science-101', 'active'),
('Machine Learning Intermediário', 'Kaggle', 'Self-paced', 'Gratuito', 'https://www.kaggle.com/learn/intermediate-machine-learning', 'active'),
('Probabilidade e Estatística', 'Veduca', '60hs', 'Gratuito', 'https://play.veduca.org/curso-online-probabilidade-e-estatistica', 'active'),
('Modelagem de Dados', 'Fundação Bradesco', '12hs', 'Gratuito', 'https://www.ev.org.br/cursos/modelagem-de-dados', 'active');

INSERT INTO code_packages (name, language, description, website_url, status) VALUES
('PyCaret', 'python', 'PyCaret é uma biblioteca de aprendizado de máquina de código aberto e baixo código em Python que automatiza fluxos de trabalho de aprendizado de máquina.', 'https://github.com/pycaret/pycaret', 'active'),
('XGBoost', 'python', 'É uma implementação da estrutura de aumento de gradiente. Ele suporta várias funções de objetivo, incluindo regressão e classificação.', 'https://xgboost.readthedocs.io/en/latest/python/', 'active'),
('shiny', 'r', 'Ferramenta para criação de aplicações web interativas e orientadas por dados.', 'https://shiny.rstudio.com/tutorial/', 'active'),
('ggplot2', 'r', 'Sistema de gráficos para R baseado na gramática dos gráficos', 'https://ggplot2.tidyverse.org/', 'active'),
('pandas', 'python', 'Biblioteca fundamental para análise de dados em Python', 'https://pandas.pydata.org/', 'active');

INSERT INTO data_sources (name, documentation_url, example_data, access_method, observations, category) VALUES
('IPEADATA', 'https://www.luanborelli.net/ipeadatapy/docs/', 'Dados econômicos, financeiros, demográficos e sociais', 'Download CSV ou XLS ou pacote ipeadatapy', '', 'Geral'),
('B3', 'https://developers.b3.com.br/apis', 'Cotações, histórico de preços, dados de mercado, entre outros', 'API REST (com endpoint e documentação em JSON para cada api)', 'Exige certificação B3 e pode ser implementado em Python usando pacote requests', 'Financeiro e Contábil'),
('Banco Mundial', 'https://wbdata.readthedocs.io/en/stable/', 'Dados econômicos e financeiros globais', 'Download arquivo CSV ou XLS ou pacote wbdata', '', 'Financeiro e Contábil'),
('Alpha Vantage', 'https://www.alphavantage.co/documentation/', 'Dados financeiros, como cotações de ações, moedas, criptomoedas, indicadores técnicos, entre outros', 'Pacote alpha_vantage', 'O uso é gratuito, mas exige cadastro e geração de chave de acesso', 'Financeiro e Contábil'),
('CEPEA', 'https://www.cepea.esalq.usp.br/br/consultas-ao-banco-de-dados-do-site.aspx', 'Histórico de preços agro

pecuária', 'Download arquivo XLS', 'Seleção de produto e período de tempo no site', 'Natureza e Agro');