import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mathematics from '@tiptap/extension-mathematics'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextAlign } from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { slashCommandsConfig } from './editor/SlashCommands'
import { Callout } from './editor/extensions/Callout'
import { Toggle } from './editor/extensions/Toggle'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, 
  List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3,
  Quote, Code2, Calculator, Table2, Image as ImageIcon, Save,
  Link as LinkIcon, Highlighter, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react'
import { Button } from './ui/button'
import { useCallback, useEffect, useRef, useState } from 'react'
import 'katex/dist/katex.min.css'

interface WikiEditorV2Props {
  content: any
  onSave: (content: any) => void
  onAutoSave?: (content: any) => void
  placeholder?: string
}

export default function WikiEditorV2({ content, onSave, onAutoSave, placeholder }: WikiEditorV2Props) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const lowlight = createLowlight()

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('wiki-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('wiki-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Erro ao fazer upload',
        description: 'Não foi possível fazer upload da imagem.',
        variant: 'destructive'
      })
      return null
    }
  }, [])

  const insertImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const url = await handleImageUpload(file)
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'wiki-link'
        }
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            align: {
              default: null,
              parseHTML: element => element.getAttribute('data-align'),
              renderHTML: attributes => {
                if (!attributes.align) return {}
                return { 'data-align': attributes.align }
              }
            }
          }
        }
      }),
      TextStyle,
      Color,
      FontFamily,
      Underline,
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Mathematics.configure({
        katexOptions: { throwOnError: false }
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Digite "/" para comandos ou comece a escrever...'
      }),
      Dropcursor,
      Gapcursor,
      Callout,
      Toggle,
      Extension.create({
        name: 'slash-commands',
        addProseMirrorPlugins() {
          return [
            Suggestion({
              editor: this.editor,
              ...slashCommandsConfig(insertImage)
            })
          ]
        }
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: 'wiki-editor-v2 prose prose-neutral max-w-none focus:outline-none min-h-[400px] p-8'
      }
    },
    onUpdate: ({ editor }) => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        if (onAutoSave) {
          onAutoSave(editor.getJSON())
          setLastSaved(new Date())
        }
      }, 800)
    }
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  const handleSave = async () => {
    if (!editor || isSaving) return

    setIsSaving(true)
    try {
      await onSave(editor.getJSON())
      setLastSaved(new Date())
      toast({
        title: 'Salvo!',
        description: 'Seu conteúdo foi salvo com sucesso.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o conteúdo.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!editor) return null

  return (
    <div className="wiki-editor-v2-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageSelected}
        className="hidden"
      />

      {/* Toolbar Completa */}
      <div className="editor-toolbar flex flex-wrap gap-2 p-3 border-b bg-muted/30">
        {/* Formatação de Texto */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Sublinhado (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Código Inline"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('highlight') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Destacar"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
        </div>

        {/* Títulos */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Título 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Listas */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista com Marcadores"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('taskList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="Lista de Tarefas"
          >
            <CheckSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Alinhamento */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Alinhar à Esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Alinhar à Direita"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Blocos Especiais */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            size="sm"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Bloco de Código"
          >
            <Code2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const latex = prompt('Digite a equação LaTeX (ex: E = mc^2):')
              if (latex) {
                editor.chain().focus().insertContent({ type: 'math_inline', attrs: { latex } }).run()
              }
            }}
            title="Equação Matemática"
          >
            <Calculator className="w-4 h-4" />
          </Button>
        </div>

        {/* Mídia */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={insertImage}
            title="Inserir Imagem"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
            title="Inserir Tabela"
          >
            <Table2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const url = prompt('Digite a URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            title="Inserir Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Salvar */}
        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />

      {/* Status de salvamento */}
      {lastSaved && (
        <div className="editor-status">
          Salvo {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
