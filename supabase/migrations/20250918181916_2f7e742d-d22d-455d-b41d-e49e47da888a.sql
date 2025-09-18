-- Inserir categorias da wiki baseadas no site atual
INSERT INTO public.wiki_categories (name, slug, description, icon, sort_order) VALUES
('Conceitos', 'conceitos', 'Conceitos fundamentais em ciência de dados', '📚', 1),
('Como fazer', 'como-fazer', 'Tutoriais práticos e guias passo a passo', '🛠️', 2),
('Aplicações', 'aplicacoes', 'Casos práticos e aplicações reais', '🎯', 3),
('Bibliotecas', 'bibliotecas', 'Ferramentas e bibliotecas para ciência de dados', '📦', 4),
('Bancos de dados', 'bancos-de-dados', 'Tudo sobre armazenamento e gerenciamento de dados', '🗄️', 5),
('Machine Learning', 'machine-learning', 'Algoritmos e técnicas de aprendizado de máquina', '🤖', 6),
('Visualização', 'visualizacao', 'Técnicas de visualização de dados', '📊', 7),
('Estatística', 'estatistica', 'Fundamentos estatísticos', '📈', 8);

-- Inserir algumas tecnologias/ferramentas populares
INSERT INTO public.technologies (name, slug, description, category, website_url, difficulty_level, is_featured) VALUES
('Python', 'python', 'Linguagem de programação versátil para ciência de dados', 'Linguagem de Programação', 'https://python.org', 'beginner', true),
('R', 'r', 'Linguagem estatística para análise de dados', 'Linguagem de Programação', 'https://r-project.org', 'intermediate', true),
('Pandas', 'pandas', 'Biblioteca Python para manipulação de dados', 'Biblioteca', 'https://pandas.pydata.org', 'beginner', true),
('NumPy', 'numpy', 'Biblioteca fundamental para computação científica em Python', 'Biblioteca', 'https://numpy.org', 'beginner', true),
('Scikit-learn', 'scikit-learn', 'Biblioteca de machine learning para Python', 'Biblioteca', 'https://scikit-learn.org', 'intermediate', true),
('TensorFlow', 'tensorflow', 'Plataforma de machine learning do Google', 'Framework', 'https://tensorflow.org', 'advanced', true),
('PyTorch', 'pytorch', 'Framework de deep learning desenvolvido pelo Facebook', 'Framework', 'https://pytorch.org', 'advanced', true),
('Jupyter', 'jupyter', 'Ambiente interativo para desenvolvimento e análise', 'Ferramenta', 'https://jupyter.org', 'beginner', true),
('Tableau', 'tableau', 'Ferramenta de visualização de dados', 'Ferramenta', 'https://tableau.com', 'intermediate', false),
('Power BI', 'power-bi', 'Ferramenta de business intelligence da Microsoft', 'Ferramenta', 'https://powerbi.microsoft.com', 'intermediate', false);