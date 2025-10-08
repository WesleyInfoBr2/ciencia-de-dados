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
  Link as LinkIcon, Highlighter
} from 'lucide-react'
import { Button } from './ui/button'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import 'katex/dist/katex.min.css'
import 'tippy.js/dist/tippy.css'

interface WikiEditorV2Props {
  content: any
  onSave: (content: any) => void
  onAutoSave?: (content: any) => void
  placeholder?: string
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

export default function WikiEditorV2({ content, onSave, onAutoSave, placeholder }: WikiEditorV2Props) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const lowlight = createLowlight()

  // DIAGNÓSTICO: logar payload recebido quando o content mudar
  useEffect(() => {
    console.group('[WikiEditorV2] Diagnóstico de content')
    console.log('typeof content =', typeof content)
    console.log('isArray content.content?', Array.isArray(content?.content))
    console.log('sample:', typeof content === 'object' ? JSON.stringify(content).slice(0, 200) : String(content).slice(0, 200))
    console.groupEnd()
  }, [content])

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
            props.command({ editor, range })
          },
          items: ({ query }: { query: string }) => {
            const items = [
              {
                title: 'Título 1',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
                }
              },
              {
                title: 'Título 2',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
                }
              },
              {
                title: 'Título 3',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
                }
              },
              {
                title: 'Lista com marcadores',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).toggleBulletList().run()
                }
              },
              {
                title: 'Lista numerada',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).toggleOrderedList().run()
                }
              },
              {
                title: 'Lista de tarefas',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).toggleTaskList().run()
                }
              },
              {
                title: 'Tabela',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                }
              },
              {
                title: 'Bloco de código',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
                }
              },
              {
                title: 'Citação',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).toggleBlockquote().run()
                }
              },
              {
                title: 'Linha horizontal',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).setHorizontalRule().run()
                }
              },
              {
                title: 'Imagem',
                command: ({ editor, range }: any) => {
                  editor.chain().focus().deleteRange(range).run()
                  insertImage()
                }
              }
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
                if (props.event.key === 'Escape') {
                  popup[0].hide()
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
  // Regras de entrada para $...$ e $$...$$
  const MathIR = Mathematics.extend({
    addInputRules() {
      return [
        this.editor.inputRule(/(?:^|[\s])\$(.+?)\$$/, ({ range, match }) => {
          const [, latex] = match
          this.editor.chain().deleteRange(range).insertContent({ type: 'mathInline', attrs: { latex } }).run()
          return null
        }),
        this.editor.inputRule(/^\$\$(.+?)\$\$$/, ({ range, match }) => {
          const [, latex] = match
          this.editor.chain().deleteRange(range).insertContent({ type: 'mathBlock', attrs: { latex } }).run()
          return null
        }),
      ]
    },
  })

  const createEditorExtensions = () => {
    return [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] }
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Digite / para inserções rápidas ou comece a escrever...'
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'wiki-link'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'wiki-image'
        }
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      CodeBlockLowlight.configure({ 
        lowlight,
        HTMLAttributes: {
          class: 'wiki-code-block'
        }
      }),
      Table.configure({ 
        resizable: true,
        HTMLAttributes: {
          class: 'wiki-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList.configure({
        HTMLAttributes: {
          class: 'wiki-task-list'
        }
      }),
      TaskItem.configure({ 
        nested: true,
        HTMLAttributes: {
          class: 'wiki-task-item'
        }
      }),
      Mathematics.configure({
        katexOptions: { 
          throwOnError: false
        }
      }),
      slashCommandExtension,
    ]
  }

  const editor = useEditor({
    editable: true,
    extensions: createEditorExtensions(),
    content,
    editorProps: {
      attributes: {
        class: 'wiki-editor-v2 prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-8'
      }
    },
    onUpdate: ({ editor }) => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        if (onAutoSave) {
          onAutoSave(editor.getJSON())
        }
      }, 2000)
    }
  }, [content])

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
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }}
            title="Inserir Tabela"
          >
            <Table2 className="w-4 h-4" />
          </Button>
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

        {/* Salvar */}
        <div className="flex gap-1 ml-auto">
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSave()
            }}
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
        <div className="editor-status text-xs text-muted-foreground px-8 py-2">
          Salvo {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
