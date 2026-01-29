import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, ExternalLink, MessageCircle, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link, useNavigate } from 'react-router-dom'
import Header from '@/components/Header'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PendingComment {
  id: string
  content: string
  guest_name: string | null
  author_id: string | null
  created_at: string
  wiki_posts: {
    title: string
    slug: string
  } | null
}

const AdminCommentModeration = () => {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [pendingComments, setPendingComments] = useState<PendingComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate('/auth')
        return
      }
      if (!isAdmin) {
        navigate('/')
        return
      }
      fetchPendingComments()
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate])

  const fetchPendingComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('wiki_post_comments')
        .select(`
          id,
          content,
          guest_name,
          author_id,
          created_at,
          wiki_posts (
            title,
            slug
          )
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      setPendingComments(data || [])
    } catch (error) {
      console.error('Erro ao buscar comentários pendentes:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os comentários pendentes.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('wiki_post_comments')
        .update({ is_approved: true })
        .eq('id', commentId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Comentário aprovado!',
      })

      setPendingComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o comentário.',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('wiki_post_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      toast({
        title: 'Comentário rejeitado',
        description: 'O comentário foi removido.',
      })

      setPendingComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (error) {
      console.error('Erro ao rejeitar comentário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o comentário.',
        variant: 'destructive',
      })
    }
  }

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Moderação de Comentários</h1>
              <p className="text-muted-foreground text-sm">
                {pendingComments.length} comentário{pendingComments.length !== 1 ? 's' : ''} pendente{pendingComments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin">
              Voltar ao Admin
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : pendingComments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Check className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tudo em dia! 🎉</h3>
              <p className="text-muted-foreground">
                Nenhum comentário pendente de moderação.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingComments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {comment.guest_name || 'Usuário anônimo'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {comment.wiki_posts && (
                      <Link
                        to={`/wiki/${comment.wiki_posts.slug}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {comment.wiki_posts.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 p-3 bg-muted/50 rounded-lg">
                    {comment.content}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(comment.id)}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(comment.id)}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCommentModeration
