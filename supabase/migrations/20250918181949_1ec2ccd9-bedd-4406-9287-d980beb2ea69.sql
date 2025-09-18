-- Inserir algumas tecnologias/ferramentas populares (apenas se não existirem)
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
('Power BI', 'power-bi', 'Ferramenta de business intelligence da Microsoft', 'Ferramenta', 'https://powerbi.microsoft.com', 'intermediate', false)
ON CONFLICT (slug) DO NOTHING;