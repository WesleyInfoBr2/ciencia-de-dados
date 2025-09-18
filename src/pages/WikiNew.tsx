import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const WikiNew = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    post_type: 'conteudo' as const,
    category_id: '',
    is_published: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    fetchCategories();
  }, [user, authLoading, navigate]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('wiki_categories')
      .select('id, name, slug, icon')
      .order('sort_order');
    
    if (data) {
      setCategories(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Verifica se o slug já existe
      const { data: existingPost } = await supabase
        .from('wiki_posts')
        .select('id')
        .eq('slug', formData.slug)
        .single();

      if (existingPost) {
        toast({
          title: "Erro",
          description: "Já existe um post com este título. Tente um título diferente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const postData = {
        ...formData,
        author_id: user.id,
        published_at: formData.is_published ? new Date().toISOString() : null,
        category_id: formData.category_id || null
      };

      const { data, error } = await supabase
        .from('wiki_posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: formData.is_published 
          ? "Artigo publicado com sucesso!" 
          : "Rascunho salvo com sucesso!",
      });

      navigate(`/wiki/${data.slug}`);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o artigo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/wiki">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Wiki
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold">Novo Artigo</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo do Artigo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Digite o título do artigo..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL (Slug)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-amigavel-do-artigo"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Gerado automaticamente a partir do título
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Resumo</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Breve descrição do artigo..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Escreva o conteúdo do artigo aqui. Você pode usar HTML para formatação."
                      rows={15}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Suporte para HTML básico: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;code&gt;, &lt;pre&gt;
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="post_type">Tipo de Post</Label>
                    <Select
                      value={formData.post_type}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, post_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conteudo">Conteúdo</SelectItem>
                        <SelectItem value="como_fazer">Como fazer</SelectItem>
                        <SelectItem value="aplicacao_pratica">Aplicação prática</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_published">Publicar agora</Label>
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      disabled={loading}
                    >
                      <Save className="h-4 w-4" />
                      {loading 
                        ? "Salvando..." 
                        : formData.is_published 
                          ? "Publicar Artigo" 
                          : "Salvar Rascunho"
                      }
                    </Button>
                    
                    {formData.title && formData.slug && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          const previewContent = `
                            <h1>${formData.title}</h1>
                            ${formData.excerpt ? `<p><strong>Resumo:</strong> ${formData.excerpt}</p>` : ''}
                            <div>${formData.content}</div>
                          `;
                          const previewWindow = window.open('', '_blank');
                          previewWindow?.document.write(`
                            <html>
                              <head><title>Preview: ${formData.title}</title></head>
                              <body style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                ${previewContent}
                              </body>
                            </html>
                          `);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WikiNew;