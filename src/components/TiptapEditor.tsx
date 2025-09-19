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
  Calculator
} from 'lucide-react'

interface TiptapEditorProps {
  content: any
  onChange: (content: any) => void
  className?: string
}

export const TiptapEditor = ({ content, onChange, className }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Mathematics,
    ],
    content: content || { type: 'doc', content: [] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  const handleImageUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !editor) return

      try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
        const filePath = `wiki/${fileName}`

        const { error } = await supabase.storage
          .from('blog')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data } = supabase.storage.from('blog').getPublicUrl(filePath)
        
        editor.chain().focus().setImage({ src: data.publicUrl }).run()
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error)
        alert('Erro ao fazer upload da imagem. Tente novamente.')
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
    const formula = window.prompt('Digite a fórmula LaTeX:')
    if (formula && editor) {
      editor.chain().focus().insertContent(`$${formula}$`).run()
    }
  }

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

        <Button variant="ghost" size="sm" onClick={handleImageUpload}>
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={insertTable}>
          <TableIcon className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={insertMath}>
          <Calculator className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none min-h-[300px]"
        />
      </div>
    </Card>
  )
}