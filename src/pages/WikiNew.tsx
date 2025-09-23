import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import WikiEditor from "@/components/WikiEditor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Save, Eye, FileText } from "lucide-react";
import { wikiPostSchema, generateSlug, type WikiPostFormData } from "@/lib/validations";

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const WikiNew = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<WikiPostFormData>({
    title: "",
    slug: "",
    content: { type: 'doc', content: [] },
    excerpt: "",
    post_type: "conteudo",
    category_id: undefined,
    is_published: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    fetchCategories();
  }, [user, authLoading, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("wiki_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const submitData = {
        ...formData,
        is_published: !isDraft,
      };

      // Validate form data
      const validatedData = wikiPostSchema.parse(submitData);
      
      // Check if slug already exists
      const { data: existingPost } = await supabase
        .from("wiki_posts")
        .select("id")
        .eq("slug", validatedData.slug)
        .single();

      if (existingPost) {
        toast.error("Já existe um artigo com este slug. Altere o título ou slug.");
        return;
      }

      const { error } = await supabase
        .from("wiki_posts")
        .insert({
          title: validatedData.title,
          slug: validatedData.slug,
          content: validatedData.content,
          excerpt: validatedData.excerpt,
          post_type: validatedData.post_type,
          category_id: validatedData.category_id,
          author_id: user.id,
          is_published: validatedData.is_published,
          published_at: validatedData.is_published ? new Date().toISOString() : null,
        });

      if (error) throw error;

      toast.success(isDraft ? "Rascunho salvo com sucesso!" : "Artigo publicado com sucesso!");
      navigate(`/wiki/${validatedData.slug}`);
    } catch (error: any) {
      console.error("Erro ao salvar artigo:", error);
      if (error.name === 'ZodError') {
        toast.error("Dados inválidos: " + error.errors.map((e: any) => e.message).join(', '));
      } else {
        toast.error("Erro ao salvar artigo. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Novo Artigo
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Digite o título do artigo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-do-artigo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">Resumo (opcional)</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Breve descrição do artigo"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo</CardTitle>
                </CardHeader>
                <CardContent>
                  <WikiEditor
                    initialContent={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  />
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
                    <Label htmlFor="post_type">Tipo</Label>
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
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="is_published">Publicar imediatamente</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={saving || !formData.title}
                    variant="outline"
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Rascunho
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={saving || !formData.title}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {formData.is_published ? 'Publicar' : 'Salvar'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiNew;