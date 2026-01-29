import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Trash2, Clock, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WikiLikesAndCommentsProps {
  postId: string
}

interface Comment {
  id: string
  author_id: string | null
  guest_name: string | null
  content: string
  is_approved: boolean
  created_at: string
  profiles?: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

export const WikiLikesAndComments = ({ postId }: WikiLikesAndCommentsProps) => {
  const { user } = useAuth()
  const { toast } = useToast()

  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchLikes()
    fetchComments()
  }, [postId])

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_post_likes')
        .select('*')
        .eq('post_id', postId)

      if (error) throw error

      setLikes(data?.length || 0)

      if (user) {
        const userLike = data?.find((like) => like.user_id === user.id)
        setIsLiked(!!userLike)
      }
    } catch (error) {
      console.error('Erro ao buscar curtidas:', error)
    }
  }

  const fetchComments = async () => {
    try {
      setLoading(true)
      // First fetch comments
      const { data: commentsData, error } = await supabase
        .from('wiki_post_comments')
        .select('id, author_id, guest_name, content, is_approved, created_at')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Then fetch profiles for those with author_id
      const authorIds = commentsData
        ?.map(c => c.author_id)
        .filter((id): id is string => id !== null) || []
      
      let profilesMap: Record<string, { full_name: string | null, username: string | null, avatar_url: string | null }> = {}
      
      if (authorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', authorIds)
        
        profilesData?.forEach(p => {
          profilesMap[p.id] = { full_name: p.full_name, username: p.username, avatar_url: p.avatar_url }
        })
      }

      // Merge comments with profiles
      const commentsWithProfiles: Comment[] = (commentsData || []).map(c => ({
        ...c,
        profiles: c.author_id ? profilesMap[c.author_id] || null : null
      }))

      setComments(commentsWithProfiles)
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Você precisa estar logado para curtir.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (isLiked) {
        await supabase
          .from('wiki_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        setIsLiked(false)
        setLikes((prev) => prev - 1)
      } else {
        await supabase.from('wiki_post_likes').insert({
          post_id: postId,
          user_id: user.id,
        })

        setIsLiked(true)
        setLikes((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Erro ao curtir:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua curtida.',
        variant: 'destructive',
      })
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast({
        title: 'Erro',
        description: 'O comentário não pode estar vazio.',
        variant: 'destructive',
      })
      return
    }

    if (!user && !guestName.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira seu nome para comentar como anônimo.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('wiki_post_comments').insert({
        post_id: postId,
        author_id: user?.id || null,
        guest_name: user ? null : guestName.trim(),
        content: newComment.trim(),
      })

      if (error) throw error

      if (user) {
        toast({
          title: 'Sucesso',
          description: 'Comentário adicionado!',
        })
        // Refresh comments for authenticated users (auto-approved)
        fetchComments()
      } else {
        toast({
          title: 'Aguardando moderação',
          description: 'Seu comentário será exibido após aprovação.',
        })
      }

      setNewComment('')
      setGuestName('')
    } catch (error) {
      console.error('Erro ao comentar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('wiki_post_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast({
        title: 'Comentário removido',
      })
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o comentário.',
        variant: 'destructive',
      })
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="wiki-likes-comments mt-12 pt-8 border-t">
      {/* Curtidas */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant={isLiked ? 'default' : 'outline'}
          size="sm"
          onClick={handleLike}
          className="gap-2"
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {likes} {likes === 1 ? 'Curtida' : 'Curtidas'}
        </Button>

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MessageCircle className="h-4 w-4" />
          {comments.length} {comments.length === 1 ? 'Comentário' : 'Comentários'}
        </div>
      </div>

      {/* Formulário de Comentário */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Deixe seu comentário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            {!user && (
              <div>
                <Input
                  placeholder="Seu nome"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Comentários anônimos passam por moderação antes de serem exibidos.
                </p>
              </div>
            )}

            <Textarea
              placeholder="Escreva seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Comentários */}
      <div className="comments-list space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Carregando comentários...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="comment flex gap-3 p-4 rounded-lg bg-muted/30"
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(comment.profiles?.full_name || comment.guest_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.profiles?.full_name || comment.guest_name || 'Anônimo'}
                    </span>
                    {!comment.author_id && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Visitante</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <p className="text-sm text-foreground/90">{comment.content}</p>

                {user && user.id === comment.author_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-destructive hover:text-destructive h-7 px-2"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}
      </div>
    </div>
  )
}

export default WikiLikesAndComments
