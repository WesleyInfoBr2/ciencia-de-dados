import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb, Flame, Zap, BookOpen, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface CalloutComponentProps {
  node: any
  updateAttributes: (attrs: Record<string, any>) => void
}

const variantConfig = {
  info: { 
    icon: Info, 
    label: 'Informação',
    bg: 'bg-blue-50 dark:bg-blue-950', 
    border: 'border-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-500'
  },
  success: { 
    icon: CheckCircle, 
    label: 'Sucesso',
    bg: 'bg-green-50 dark:bg-green-950', 
    border: 'border-green-400',
    text: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-500'
  },
  warning: { 
    icon: AlertTriangle, 
    label: 'Atenção',
    bg: 'bg-yellow-50 dark:bg-yellow-950', 
    border: 'border-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-500'
  },
  error: { 
    icon: AlertCircle, 
    label: 'Erro',
    bg: 'bg-red-50 dark:bg-red-950', 
    border: 'border-red-400',
    text: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-500'
  },
  tip: { 
    icon: Lightbulb, 
    label: 'Dica',
    bg: 'bg-purple-50 dark:bg-purple-950', 
    border: 'border-purple-400',
    text: 'text-purple-900 dark:text-purple-100',
    iconColor: 'text-purple-500'
  },
  note: { 
    icon: BookOpen, 
    label: 'Nota',
    bg: 'bg-slate-50 dark:bg-slate-900', 
    border: 'border-slate-400',
    text: 'text-slate-900 dark:text-slate-100',
    iconColor: 'text-slate-500'
  },
  important: { 
    icon: Flame, 
    label: 'Importante',
    bg: 'bg-orange-50 dark:bg-orange-950', 
    border: 'border-orange-400',
    text: 'text-orange-900 dark:text-orange-100',
    iconColor: 'text-orange-500'
  },
  example: { 
    icon: Zap, 
    label: 'Exemplo',
    bg: 'bg-cyan-50 dark:bg-cyan-950', 
    border: 'border-cyan-400',
    text: 'text-cyan-900 dark:text-cyan-100',
    iconColor: 'text-cyan-500'
  },
  question: { 
    icon: HelpCircle, 
    label: 'Pergunta',
    bg: 'bg-indigo-50 dark:bg-indigo-950', 
    border: 'border-indigo-400',
    text: 'text-indigo-900 dark:text-indigo-100',
    iconColor: 'text-indigo-500'
  },
}

type VariantKey = keyof typeof variantConfig

const CalloutComponent = ({ node, updateAttributes }: CalloutComponentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const variant = (node.attrs.variant as VariantKey) || 'info'
  const config = variantConfig[variant] || variantConfig.info
  const Icon = config.icon

  const handleVariantChange = (newVariant: VariantKey) => {
    updateAttributes({ variant: newVariant })
    setIsOpen(false)
  }

  return (
    <NodeViewWrapper 
      className={`callout-wrapper rounded-lg border-l-4 p-4 my-4 ${config.bg} ${config.border} ${config.text}`}
      data-variant={variant}
    >
      <div className="flex items-start gap-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button 
              type="button"
              className={`callout-icon flex-shrink-0 mt-0.5 ${config.iconColor} hover:opacity-70 transition-opacity cursor-pointer`}
              title="Clique para alterar o tipo"
            >
              <Icon className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            <div className="grid gap-0.5">
              {(Object.keys(variantConfig) as VariantKey[]).map((key) => {
                const v = variantConfig[key]
                const VIcon = v.icon
                return (
                  <button
                    key={key}
                    onClick={() => handleVariantChange(key)}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors w-full text-left ${
                      key === variant ? 'bg-muted' : ''
                    }`}
                  >
                    <VIcon className={`h-4 w-4 ${v.iconColor}`} />
                    <span>{v.label}</span>
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
        <div className="callout-content flex-1 prose prose-sm max-w-none [&>p]:m-0 [&>p:first-child]:mt-0">
          <NodeViewContent className="callout-inner" />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default CalloutComponent
