import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { SuggestionOptions, SuggestionKeyDownProps } from '@tiptap/suggestion'
import { 
  Type, Heading1, Heading2, Heading3, List, ListOrdered, 
  CheckSquare, ChevronRight, AlertCircle, Table2, Image as ImageIcon,
  Code2, Quote, Minus, Calculator, Link2, Columns2
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface CommandItem {
  title: string
  description: string
  icon: any
  command: (props: any) => void
  searchTerms?: string[]
}

interface SlashCommandsProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

export const SlashCommandsList = forwardRef<any, SlashCommandsProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    }
  }))

  return (
    <div className="slash-commands-menu">
      {props.items.length > 0 ? (
        props.items.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              className={`slash-command-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => selectItem(index)}
            >
              <Icon className="w-4 h-4 mr-2" />
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </button>
          )
        })
      ) : (
        <div className="slash-command-empty">Nenhum resultado</div>
      )}
    </div>
  )
})

SlashCommandsList.displayName = 'SlashCommandsList'

export const slashCommandsConfig = (onImageUpload: () => void): Omit<SuggestionOptions, 'editor'> => ({
  items: ({ query }: { query: string }) => {
    const commands: CommandItem[] = [
      {
        title: 'Parágrafo',
        description: 'Texto comum',
        icon: Type,
        searchTerms: ['p', 'paragraph'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('paragraph').run()
        }
      },
      {
        title: 'Título 1',
        description: 'Título grande',
        icon: Heading1,
        searchTerms: ['h1', 'heading1', 'titulo'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
        }
      },
      {
        title: 'Título 2',
        description: 'Título médio',
        icon: Heading2,
        searchTerms: ['h2', 'heading2'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
        }
      },
      {
        title: 'Título 3',
        description: 'Título pequeno',
        icon: Heading3,
        searchTerms: ['h3', 'heading3'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
        }
      },
      {
        title: 'Lista',
        description: 'Lista com marcadores',
        icon: List,
        searchTerms: ['ul', 'bullet'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run()
        }
      },
      {
        title: 'Lista Numerada',
        description: 'Lista ordenada',
        icon: ListOrdered,
        searchTerms: ['ol', 'numbered'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        }
      },
      {
        title: 'Tarefas',
        description: 'Lista de tarefas',
        icon: CheckSquare,
        searchTerms: ['todo', 'task', 'checkbox'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleTaskList().run()
        }
      },
      {
        title: 'Toggle',
        description: 'Conteúdo recolhível',
        icon: ChevronRight,
        searchTerms: ['collapse', 'expandir'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setToggle().run()
        }
      },
      {
        title: 'Callout',
        description: 'Bloco de destaque',
        icon: AlertCircle,
        searchTerms: ['note', 'aviso', 'alert'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setCallout({ variant: 'info', emoji: '💡' }).run()
        }
      },
      {
        title: 'Tabela',
        description: 'Inserir tabela',
        icon: Table2,
        searchTerms: ['table'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3 }).run()
        }
      },
      {
        title: 'Imagem',
        description: 'Upload de imagem',
        icon: ImageIcon,
        searchTerms: ['img', 'photo', 'foto'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run()
          onImageUpload()
        }
      },
      {
        title: 'Código',
        description: 'Bloco de código',
        icon: Code2,
        searchTerms: ['code', 'codeblock'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setCodeBlock().run()
        }
      },
      {
        title: 'Citação',
        description: 'Bloco de citação',
        icon: Quote,
        searchTerms: ['blockquote', 'quote'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setBlockquote().run()
        }
      },
      {
        title: 'Divisor',
        description: 'Linha horizontal',
        icon: Minus,
        searchTerms: ['hr', 'divider', 'separator'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        }
      },
      {
        title: 'Equação',
        description: 'Fórmula matemática',
        icon: Calculator,
        searchTerms: ['math', 'latex', 'formula'],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setMathInline().run()
        }
      }
    ]

    return commands.filter(item => {
      const searchText = query.toLowerCase()
      return (
        item.title.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        item.searchTerms?.some(term => term.toLowerCase().includes(searchText))
      )
    })
  },

  render: () => {
    let component: ReactRenderer<any>
    let popup: TippyInstance[]

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(SlashCommandsList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

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

        if (!props.clientRect) {
          return
        }

        popup[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0]?.hide()
          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0]?.destroy()
        component.destroy()
      },
    }
  },
})
