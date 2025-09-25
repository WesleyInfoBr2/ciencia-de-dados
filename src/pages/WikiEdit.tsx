import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import WikiEditor from "@/components/WikiEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface WikiPost {
  id: string;
  title: string;
  slug: string;
  content: any;
  excerpt: string;
  author_id: string;
  post_type: 'conteudo' | 'como_fazer' | 'aplicacao_pratica';
  category_id: string;
  is_published: boolean;
  published_at?: string;
}

const WikiEdit = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<WikiPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: { type: 'doc', content: [] },
    category_id: '',
    tags: [] as string[],
    is_published: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (slug) {
      fetchPost();
      fetchCategories();
    }
  }, [user, authLoading, navigate, slug]);

  const fetchPost = async () => {
    if (!slug) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('wiki_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      toast({
        title: "Erro",
        description: "Post não encontrado.",
        variant: "destructive",
      });
      navigate('/wiki');
      return;
    }

    // Verificar se o usuário é o autor
    if (data.author_id !== user?.id) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar seus próprios artigos.",
        variant: "destructive",
      });
      navigate(`/wiki/${slug}`);
      return;
    }

    setPost(data);
    
    // Convert content to proper format for Tiptap
    let content;
    if (typeof data.content === 'string') {
      // HTML content - convert to basic ProseMirror JSON structure
      const htmlContent = data.content;
      content = {
        type: 'doc',
        content: htmlContent ? [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          }]
        }] : []
      };
    } else if (typeof data.content === 'object' && data.content !== null) {
      content = data.content as any;
    } else {
      content = { type: 'doc', content: [] };
    }
    
    setFormData({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: content,
      category_id: data.category_id || '',
      tags: data.tags || [],
      is_published: data.is_published
    });
    setLoading(false);
  };

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
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
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
    if (!user || !post) return;

    setSaving(true);

    try {
      // Verifica se o slug já existe (exceto o post atual)
      if (formData.slug !== post.slug) {
        const { data: existingPost } = await supabase
          .from('wiki_posts')
          .select('id')
          .eq('slug', formData.slug)
          .neq('id', post.id)
          .single();

        if (existingPost) {
          toast({
            title: "Erro",
            description: "Já existe um post com este título. Tente um título diferente.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      const updateData = {
        ...formData,
        published_at: formData.is_published && !post.is_published ? new Date().toISOString() : (post.published_at || null),
        category_id: formData.category_id || null
      };

      const { error } = await supabase
        .from('wiki_posts')
        .update(updateData)
        .eq('id', post.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Artigo atualizado com sucesso!",
      });

      navigate(`/wiki/${formData.slug}`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o artigo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    try {
      const { error } = await supabase
        .from('wiki_posts')
        .delete()
        .eq('id', post.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Artigo excluído com sucesso!",
      });

      navigate('/wiki');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o artigo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to={`/wiki/${post.slug}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Artigo
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold">Editar Artigo</h1>
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
                    <Input
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Breve descrição do artigo..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo *</Label>
                    <WikiEditor
                      initialContent={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Dicas:</strong>
                      <br />• Use o botão de fórmula (∑) para adicionar equações matemáticas
                      <br />• Para imagens, use URLs de imagens hospedadas online
                      <br />• Use Ctrl+K para adicionar links rapidamente
                      <br />• Suporte completo para formatação rica: títulos, listas, citações, código
                      <br />• Evite fazer upload direto de imagens (pode corromper o conteúdo)
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

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                        setFormData(prev => ({ ...prev, tags }));
                      }}
                      placeholder="Separar por vírgulas"
                    />
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
                      disabled={saving}
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                    
                    {formData.title && formData.content && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          const previewWindow = window.open('', '_blank');
                          if (previewWindow) {
                            previewWindow.document.write(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Preview: ${formData.title}</title>
                                  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
                                  <style>
                                    body { 
                                      max-width: 800px; 
                                      margin: 0 auto; 
                                      padding: 20px; 
                                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                      line-height: 1.6;
                                    }
                                    h1, h2, h3, h4, h5, h6 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
                                    p { margin-bottom: 1rem; }
                                    pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto; }
                                    blockquote { border-left: 4px solid #007bff; padding-left: 1rem; margin: 1rem 0; color: #6c757d; }
                                    img { max-width: 100%; height: auto; margin: 1rem 0; }
                                    .math-formula, .katex { margin: 0.2rem; }
                                  </style>
                                </head>
                                <body>
                                  <h1>${formData.title}</h1>
                                  ${formData.excerpt ? `<p><em>${formData.excerpt}</em></p><hr>` : ''}
                                  <div>${formData.content}</div>
                                </body>
                              </html>
                            `);
                            previewWindow.document.close();
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full gap-2">
                          <Trash2 className="h-4 w-4" />
                          Excluir Artigo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O artigo será permanentemente excluído.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default WikiEdit;