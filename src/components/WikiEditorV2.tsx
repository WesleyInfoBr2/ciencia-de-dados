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
import { slashCommandsConfig } from './editor/SlashCommands'
import { Callout } from './editor/extensions/Callout'
import { Toggle } from './editor/extensions/Toggle'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Highlighter, Link as LinkIcon, Image as ImageIcon,
  Table2, Plus, Trash2, Save, Copy
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
        placeholder: placeholder || 'Digite "/" para comandos...'
      }),
      Dropcursor,
      Gapcursor,
      Callout,
      Toggle
    ],
    content,
    editorProps: {
      attributes: {
        class: 'wiki-editor-v2 prose prose-neutral max-w-none focus:outline-none'
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

      {/* Toolbar simples no topo */}
      <div className="editor-toolbar flex gap-2 p-4 border-b">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={insertImage}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
          >
            <Table2 className="w-4 h-4" />
          </Button>
        </div>

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
