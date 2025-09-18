import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Edit, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RichTextViewer from "@/components/RichTextViewer";

interface WikiPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  post_type: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  wiki_categories: {
    name: string;
    slug: string;
    icon: string;
  } | null;
}

const WikiPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<WikiPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    if (!slug) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('wiki_posts')
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        author_id,
        is_published,
        published_at,
        created_at,
        post_type,
        profiles!wiki_posts_author_id_fkey (
          full_name,
          username,
          avatar_url
        ),
        wiki_categories (
          name,
          slug,
          icon
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Erro",
        description: "Post não encontrado ou não publicado.",
        variant: "destructive",
      });
      navigate('/wiki');
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPostTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'conteudo': 'Conteúdo',
      'como_fazer': 'Como fazer',
      'aplicacao_pratica': 'Aplicação prática'
    };
    return types[type] || type;
  };

  const getPostTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'conteudo': 'bg-blue-100 text-blue-800',
      'como_fazer': 'bg-green-100 text-green-800',
      'aplicacao_pratica': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Post não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O artigo que você está procurando não existe ou não está publicado.
            </p>
            <Link to="/wiki">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Wiki
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="max-w-4xl mx-auto p-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/wiki">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Wiki
            </Button>
          </Link>

          {user && user.id === post.author_id && (
            <Link to={`/wiki/edit/${post.slug}`}>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          )}
        </div>

        {/* Article Header */}
        <article className="bg-card rounded-lg shadow-sm">
          <div className="p-8 border-b">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Badge className={getPostTypeColor(post.post_type)}>
                  {getPostTypeLabel(post.post_type)}
                </Badge>
                {post.wiki_categories && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-lg">{post.wiki_categories.icon}</span>
                    <span className="text-sm">{post.wiki_categories.name}</span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {post.profiles?.full_name || post.profiles?.username || 'Autor'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            <RichTextViewer 
              content={post.content}
              className="max-w-none"
            />
          </div>
        </article>

        {/* Author Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg">
                  {post.profiles?.full_name || post.profiles?.username || 'Autor'}
                </h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Contribuidor da comunidade
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default WikiPost;