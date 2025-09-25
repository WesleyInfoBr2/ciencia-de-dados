import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Edit, BookOpen, Clock, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WikiViewer from "@/components/WikiViewer";
import { TableOfContents } from "@/components/TableOfContents";
import { updatePageMetadata, generateStructuredData, calculateReadingTime } from "@/utils/seo";
import Header from "@/components/Header";

interface WikiPostData {
  id: string;
  title: string;
  slug: string;
  content: any;
  excerpt: string;
  author_id: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  tags: string[] | null;
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
  const [readingTime, setReadingTime] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState<WikiPostData[]>([]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      updateSEOMetadata();
      calculateReadingTimeFromContent();
      fetchRelatedPosts();
    }
  }, [post]);

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
        updated_at,
        tags,
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

  const updateSEOMetadata = () => {
    if (!post) return;

    const url = `https://cienciadedados.org/wiki/${post.slug}`;
    const authorName = post.profiles?.full_name || post.profiles?.username || 'CiênciaDeDados.org';
    
    updatePageMetadata({
      title: `${post.title} | CiênciaDeDados.org`,
      description: post.excerpt || `Artigo sobre ${post.title} na plataforma brasileira de ciência de dados.`,
      canonical: url,
      ogTitle: post.title,
      ogDescription: post.excerpt || `Artigo sobre ${post.title}`,
      ogType: 'article',
      ogImage: `https://cienciadedados.org/og-image.jpg`,
      articlePublishedTime: post.published_at,
      articleModifiedTime: post.updated_at,
      articleTags: post.tags || [],
      author: authorName
    });

    generateStructuredData('Article', {
      title: post.title,
      excerpt: post.excerpt,
      author: authorName,
      publishedAt: post.published_at,
      updatedAt: post.updated_at,
      tags: post.tags || [],
      category: post.wiki_categories?.name,
      url
    });
  };

  const calculateReadingTimeFromContent = () => {
    if (!post?.content) return;
    
    // Extract text from Tiptap content
    const extractText = (node: any): string => {
      if (node.type === 'text') return node.text || '';
      if (node.content) {
        return node.content.map(extractText).join(' ');
      }
      return '';
    };

    const contentText = extractText(post.content);
    setReadingTime(calculateReadingTime(contentText));
  };

  const fetchRelatedPosts = async () => {
    if (!post) return;

    try {
      const { data } = await supabase
        .from('wiki_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          published_at,
          wiki_categories(name, icon)
        `)
        .eq('is_published', true)
        .neq('id', post.id)
        .or('category_id.is.not.null')
        .limit(3);

      if (data) {
        setRelatedPosts(data as any);
      }
    } catch (error) {
      console.error('Erro ao buscar posts relacionados:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li><Link to="/wiki" className="hover:text-primary">Wiki</Link></li>
                <ChevronRight className="h-4 w-4" />
                {post.wiki_categories && (
                  <>
                    <li>{post.wiki_categories.name}</li>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
                <li className="text-foreground font-medium line-clamp-1">{post.title}</li>
              </ol>
            </nav>

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
              <header className="p-8 border-b">
                {post.wiki_categories && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-lg" role="img" aria-label={post.wiki_categories.name}>
                      {post.wiki_categories.icon}
                    </span>
                    <span className="text-sm">{post.wiki_categories.name}</span>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {post.profiles?.full_name || post.profiles?.username || 'Autor'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <time dateTime={post.published_at || post.created_at}>
                      {formatDate(post.published_at || post.created_at)}
                    </time>
                  </div>
                  {readingTime > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>{readingTime} min de leitura</span>
                    </div>
                  )}
                </div>
              </header>

              {/* Article Content */}
              <div className="p-8">
                <WikiViewer 
                  content={post.content}
                  mode="tiptap"
                />
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-8" aria-labelledby="related-posts-heading">
                <h2 id="related-posts-heading" className="text-2xl font-bold mb-4">
                  Artigos Relacionados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          <Link 
                            to={`/wiki/${relatedPost.slug}`}
                            className="hover:text-primary"
                          >
                            {relatedPost.title}
                          </Link>
                        </h3>
                        {relatedPost.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {formatDate(relatedPost.published_at)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TableOfContents content={post.content} className="mb-8" />

            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" aria-hidden="true" />
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
      </main>
    </div>
  );
};

export default WikiPost;