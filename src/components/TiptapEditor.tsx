import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlock from '@tiptap/extension-code-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Mathematics from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Calculator,
  Copy,
  Loader2
} from 'lucide-react'

interface TiptapEditorProps {
  content: any
  onChange: (content: any) => void
  className?: string
}

export const TiptapEditor = ({ content, onChange, className }: TiptapEditorProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use our custom CodeBlock
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
          loading: 'lazy',
        },
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border w-full my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted p-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto relative',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'my-4',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1',
        },
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
          displayMode: false,
        },
      }),
    ],
    content: content || { type: 'doc', content: [] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-2',
      },
    },
  })

  const handleImageUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !editor) return

      setUploading(true);
      
      try {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Arquivo muito grande. Máximo 5MB.');
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Apenas arquivos de imagem são permitidos.');
        }

        // Generate optimized filename
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `wiki-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
        const filePath = `wiki/${fileName}`

        // Get current position to replace later
        const currentPos = editor.state.selection.from;
        
        // Show loading state
        editor.chain().focus().insertContent('🔄 Fazendo upload da imagem...').run();

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('blog')
          .upload(filePath, file, {
            cacheControl: '31536000', // 1 year cache
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('blog').getPublicUrl(filePath)
        
        // Remove loading message by selecting and deleting it
        editor.chain()
          .focus()
          .setTextSelection({ from: currentPos, to: currentPos + 32 }) // Select loading text
          .deleteSelection()
          .setImage({ 
            src: data.publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, ""), // filename without extension as alt
            title: file.name
          })
          .run()

        toast({
          description: "Imagem carregada com sucesso!",
        });

      } catch (error: any) {
        console.error('Erro ao fazer upload da imagem:', error)
        
        // Remove loading message by finding and deleting it
        const currentContent = editor.getHTML();
        if (currentContent.includes('🔄 Fazendo upload da imagem...')) {
          const newContent = currentContent.replace('🔄 Fazendo upload da imagem...', '');
          editor.commands.setContent(newContent);
        }
        
        toast({
          title: "Erro no upload",
          description: error.message || "Erro ao fazer upload da imagem. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
    input.click()
  }

  const addLink = () => {
    const url = window.prompt('Digite a URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }

  const insertMath = () => {
    const formula = window.prompt('Digite a fórmula LaTeX (sem $):')
    if (formula && editor) {
      const isDisplay = window.confirm('Fórmula em linha separada (display)?');
      editor.chain().focus().insertContent({
        type: 'text',
        text: isDisplay ? `$$${formula}$$` : `$${formula}$`
      }).run()
    }
  }

  const copyCodeBlock = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        description: "Código copiado para a área de transferência!",
      });
    }).catch(() => {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    });
  };

  if (!editor) {
    return (
      <Card className={`p-4 ${className || ""}`}>
        <div className="h-64 animate-pulse bg-muted rounded"></div>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Formatting buttons */}
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-accent' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Headings */}
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Lists */}
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor.isActive('taskList') ? 'bg-accent' : ''}
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Block elements */}
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost" 
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Insert elements */}
        <Button variant="ghost" size="sm" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleImageUpload}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>

        <Button variant="ghost" size="sm" onClick={insertTable}>
          <TableIcon className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={insertMath}>
          <Calculator className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none min-h-[300px]"
        />
        
        {/* CSS for editor styling */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .tiptap pre {
              position: relative;
            }
            .tiptap pre code {
              display: block;
              overflow-x: auto;
            }
            .tiptap .katex-display {
              margin: 1rem 0;
              text-align: center;
            }
            .tiptap .katex {
              font-size: 1.1em;
            }
            .tiptap ul {
              list-style-type: disc;
              margin-left: 1.5rem;
            }
            .tiptap ol {
              list-style-type: decimal;
              margin-left: 1.5rem;
            }
            .tiptap li {
              margin: 0.25rem 0;
            }
            .tiptap h1 {
              font-size: 16px;
              font-weight: bold;
              margin: 1rem 0 0.5rem 0;
            }
            .tiptap h2 {
              font-size: 14px;
              font-weight: bold;
              margin: 0.75rem 0 0.5rem 0;
            }
            .tiptap h3 {
              font-size: inherit;
              font-weight: bold;
              margin: 0.5rem 0 0.25rem 0;
            }
            .tiptap a {
              color: hsl(var(--primary));
              text-decoration: underline;
            }
            .tiptap a:hover {
              color: hsl(var(--primary) / 0.8);
            }
          `
        }} />
      </div>
    </Card>
  )
}