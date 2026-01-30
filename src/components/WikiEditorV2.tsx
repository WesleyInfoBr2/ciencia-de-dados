import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics'
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
import { TextAlign } from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension, textInputRule } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, 
  List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3,
  Quote, Code2, Calculator, Table2, Image as ImageIcon, Save,
  Link as LinkIcon, Highlighter, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ZoomIn, ZoomOut, MessageSquare
} from 'lucide-react'
import { Button } from './ui/button'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import 'katex/dist/katex.min.css'
import 'tippy.js/dist/tippy.css'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { normalizeWikiContent } from './normalizeWikiContent'
import { wikiBaseExtensions } from '@/lib/wiki/extensions'
import { TableMenu } from './editor/TableMenu'

interface WikiEditorV2Props {
  content: any
  onSave: (content: any) => void
  onAutoSave?: (content: any) => void
  placeholder?: string
  onEditorReady?: (editor: TiptapEditor) => void
}

interface CommandItemProps {
  title: string
  command: () => void
}

const CommandsList = ({ items, command }: any) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : items.length - 1
        )
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((prevIndex) => 
          prevIndex < items.length - 1 ? prevIndex + 1 : 0
        )
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        command(items[selectedIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, items, command])

  return (
    <div className="slash-commands-menu bg-popover text-popover-foreground border rounded-lg shadow-lg p-2 max-w-xs">
      {items.length > 0 ? (
        items.map((item: CommandItemProps, index: number) => (
          <button
            key={index}
            type="button"
            onClick={() => command(item)}
            className={`w-full text-left px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition-colors ${
              index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <div className="font-medium text-sm">{item.title}</div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          Nenhum resultado
        </div>
      )}
    </div>
  )
}

export default function WikiEditorV2({ content, onSave, onAutoSave, placeholder, onEditorReady }: WikiEditorV2Props) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Track image selection to refresh toolbar on selection changes
  const [isImageSelected, setIsImageSelected] = useState(false)
  const [imageAlign, setImageAlign] = useState<string | undefined>(undefined)

  const normalized = normalizeWikiContent(content)

  // DIAGNÓSTICO: logar payload recebido quando o content mudar
  useEffect(() => {
    console.group('[WikiEditorV2] Diagnóstico de content')
    console.log('typeof raw content =', typeof content)
    console.log('typeof normalized =', typeof normalized, 'is doc?', normalized?.type === 'doc')
    console.log('isArray normalized.content?', Array.isArray((normalized as any)?.content))
    console.log('sample:', typeof normalized === 'object' ? JSON.stringify(normalized).slice(0, 200) : String(content).slice(0, 200))
    console.groupEnd()
  }, [content, normalized])

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
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

  // Configuração do slash command ANTES de criar as extensões
  const slashCommandExtension = Extension.create({
    name: 'slashCommands',
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: '/',
          command: ({ editor, range, props }) => {
            try {
              // Remove apenas uma vez o texto digitado ("/" + consulta)
              editor.chain().focus().deleteRange(range).run()
              // Executa o comando do item selecionado
              if (props && typeof (props as any).command === 'function') {
                ;(props as any).command({ editor, range })
              }
            } catch (e) {
              console.error('[Slash] command error', e)
            }
          },
          items: ({ query }: { query: string }) => {
            const items = [
              {
                title: 'Título 1',
                command: ({ editor }: any) => {
                  editor.chain().focus().setHeading({ level: 1 }).run()
                }
              },
              {
                title: 'Título 2',
                command: ({ editor }: any) => {
                  editor.chain().focus().setHeading({ level: 2 }).run()
                }
              },
              {
                title: 'Título 3',
                command: ({ editor }: any) => {
                  editor.chain().focus().setHeading({ level: 3 }).run()
                }
              },
              {
                title: 'Lista com marcadores',
                command: ({ editor }: any) => {
                  editor.chain().focus().toggleBulletList().run()
                }
              },
              {
                title: 'Lista numerada',
                command: ({ editor }: any) => {
                  editor.chain().focus().toggleOrderedList().run()
                }
              },
              {
                title: 'Lista de tarefas',
                command: ({ editor }: any) => {
                  editor.chain().focus().toggleTaskList().run()
                }
              },
              {
                title: 'Tabela',
                command: ({ editor }: any) => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                }
              },
              {
                title: 'Bloco de código',
                command: ({ editor }: any) => {
                  editor.chain().focus().toggleCodeBlock().run()
                }
              },
              {
                title: 'Citação',
                command: ({ editor }: any) => {
                  editor.chain().focus().toggleBlockquote().run()
                }
              },
              {
                title: 'Linha horizontal',
                command: ({ editor }: any) => {
                  editor.chain().focus().setHorizontalRule().run()
                }
              },
              {
                title: 'Imagem',
                command: ({ editor }: any) => {
                  editor.chain().focus().run()
                  insertImage()
                }
              },
              {
                title: 'Equação',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).insertInlineMath({ latex: '' }).run()
                }
              },
              {
                title: 'Callout Info',
                command: ({ editor }: any) => {
                  editor.chain().focus().setCallout({ variant: 'info', emoji: '💡' }).run()
                }
              },
              {
                title: 'Callout Aviso',
                command: ({ editor }: any) => {
                  editor.chain().focus().setCallout({ variant: 'warning', emoji: '⚠️' }).run()
                }
              },
              {
                title: 'Callout Sucesso',
                command: ({ editor }: any) => {
                  editor.chain().focus().setCallout({ variant: 'success', emoji: '✅' }).run()
                }
              },
              {
                title: 'Callout Erro',
                command: ({ editor }: any) => {
                  editor.chain().focus().setCallout({ variant: 'error', emoji: '❌' }).run()
                }
              },
              {
                title: 'Toggle / Acordeão',
                command: ({ editor }: any) => {
                  editor.chain().focus().setToggle({ summary: 'Clique para expandir' }).run()
                }
              },
            ]

            return items.filter(item => 
              item.title.toLowerCase().includes(query.toLowerCase())
            )
          },
          render: () => {
            let component: ReactRenderer
            let popup: TippyInstance[]

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(CommandsList, {
                  props,
                  editor: props.editor,
                })

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props: any) {
                component.updateProps(props)

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },
              onKeyDown(props: any) {
                // Intercepta teclas para evitar submit do formulário da página
                const k = props.event.key
                if (k === 'Enter' || k === 'ArrowUp' || k === 'ArrowDown' || k === 'Tab' || k === 'Escape') {
                  if (k === 'Escape') popup[0].hide()
                  props.event.preventDefault()
                  props.event.stopPropagation()
                  return true
                }
                return false
              },
              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
        })
      ]
    },
  })

  // CRITICAL: Usar EXATAMENTE as mesmas extensões do WikiViewerV2

  const buildExtensions = () => {
    return [
      ...wikiBaseExtensions(placeholder || 'Digite / para inserções rápidas ou comece a escrever...'),
      slashCommandExtension,
    ]
  }

  // Memoize extensions para evitar recriação
  const extensionsRef = useRef(buildExtensions())

  const editor = useEditor({
    editable: true,
    extensions: extensionsRef.current,
    content: normalized,
    editorProps: {
      attributes: {
        class: 'wiki-editor-v2 prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-8'
      },
      // Interceptar paste de imagens e fazer upload para Supabase
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
              // Upload assíncrono e inserção da imagem
              handleImageUpload(file).then(url => {
                if (url && view.state) {
                  const { tr } = view.state
                  const node = view.state.schema.nodes.image.create({ src: url })
                  const transaction = tr.replaceSelectionWith(node)
                  view.dispatch(transaction)
                }
              })
            }
            return true // Impede o comportamento padrão (base64)
          }
        }
        return false // Deixa o comportamento padrão para outros tipos
      },
      // Interceptar drop de imagens
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false // Se foi movido internamente, não interceptar
        
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false

        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleImageUpload(file).then(url => {
              if (url && view.state) {
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  const node = view.state.schema.nodes.image.create({ src: url })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
              }
            })
            return true
          }
        }
        return false
      }
    },
    onCreate: ({ editor }) => {
      try {
        migrateMathStrings(editor)
      } catch (e) {
        console.warn('[Wiki] migrateMathStrings onCreate failed', e)
      }
    },
    onUpdate: ({ editor }) => {
      try {
        migrateMathStrings(editor)
      } catch (e) {
        console.warn('[Wiki] migrateMathStrings onUpdate failed', e)
      }
      // Auto-save com debounce - NÃO chama setFormData aqui para evitar re-render
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        if (onAutoSave) {
          onAutoSave(editor.getJSON())
        }
      }, 3000) // Aumentado para 3 segundos para menos interrupções
    }
  }, []) // CRÍTICO: Array vazio para NÃO recriar o editor

  useEffect(() => { if (editor && onEditorReady) onEditorReady(editor) }, [editor])

  useEffect(() => {
    if (!editor) return
    console.log('[Wiki] extensions =', editor.extensionManager.extensions.map(e => e.name))
    console.log('[Wiki] getHTML =', editor.getHTML()?.slice(0, 120))
  }, [editor])

  // Re-render toolbar on selection changes and track image selection/attrs
  useEffect(() => {
    if (!editor) return
    const updateSelectionState = () => {
      try {
        const sel: any = editor.state.selection as any
        const node = sel?.node
        const selected = !!node && node.type?.name === 'image'
        setIsImageSelected(selected)
        setImageAlign(selected ? (node?.attrs?.align ?? editor.getAttributes('image')?.align) : undefined)
      } catch (e) {
        // noop
      }
    }
    editor.on('selectionUpdate', updateSelectionState)
    editor.on('transaction', updateSelectionState)
    // Run once initially
    updateSelectionState()
    return () => {
      editor.off('selectionUpdate', updateSelectionState)
      editor.off('transaction', updateSelectionState)
    }
  }, [editor])

  // Keyboard shortcut for save
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
            type="button"
            size="sm"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleBold().run()
            }}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleItalic().run()
            }}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleUnderline().run()
            }}
            title="Sublinhado (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleStrike().run()
            }}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleCode().run()
            }}
            title="Código Inline"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('highlight') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleHighlight().run()
            }}
            title="Destacar"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
        </div>

        {/* Títulos */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }}
            title="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }}
            title="Título 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Listas */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleBulletList().run()
            }}
            title="Lista com Marcadores"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleOrderedList().run()
            }}
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('taskList') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleTaskList().run()
            }}
            title="Lista de Tarefas"
          >
            <CheckSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Blocos Especiais */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleBlockquote().run()
            }}
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().toggleCodeBlock().run()
            }}
            title="Bloco de Código"
          >
            <Code2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const latex = prompt('Digite a equação LaTeX (ex: E = mc^2 ou x^2 + y^2 = z^2):')
              if (latex && editor) {
                editor.chain().focus().insertContent(`$${latex}$`).run()
              }
            }}
            title="Equação Matemática (ou digite $...$)"
          >
            <Calculator className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('callout') ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().setCallout({ variant: 'info', emoji: '💡' }).run()
            }}
            title="Inserir Callout"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Alinhamento */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().setTextAlign('left').run()
            }}
            title="Alinhar à Esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().setTextAlign('center').run()
            }}
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().setTextAlign('right').run()
            }}
            title="Alinhar à Direita"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().setTextAlign('justify').run()
            }}
            title="Justificar"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        {/* Mídia */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              insertImage()
            }}
            title="Inserir Imagem"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <TableMenu editor={editor} />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const url = prompt('Digite a URL:')
              if (url && editor) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            title="Inserir Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Controles de Imagem (aparecem quando imagem selecionada) */}
        {isImageSelected && (
          <div className="flex gap-1 border-r pr-2 bg-primary/10">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const width = prompt('Largura da imagem (em pixels, ex: 400):', '400')
                if (width) {
                  editor.chain().focus().updateAttributes('image', {
                    width: `${width}px`,
                    height: 'auto'
                  }).run()
                }
              }}
              title="Redimensionar Imagem"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={imageAlign === 'left' ? 'default' : 'ghost'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                editor.chain().focus().updateAttributes('image', { align: 'left' }).run()
                setImageAlign('left')
              }}
              title="Alinhar Imagem à Esquerda"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={imageAlign === 'center' ? 'default' : 'ghost'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                editor.chain().focus().updateAttributes('image', { align: 'center' }).run()
                setImageAlign('center')
              }}
              title="Centralizar Imagem"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={imageAlign === 'right' ? 'default' : 'ghost'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                editor.chain().focus().updateAttributes('image', { align: 'right' }).run()
                setImageAlign('right')
              }}
              title="Alinhar Imagem à Direita"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        )}

      </div>

      {/* Editor com scroll interno para manter toolbar visível */}
      <div className="editor-content-wrapper overflow-y-auto max-h-[60vh] border rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
