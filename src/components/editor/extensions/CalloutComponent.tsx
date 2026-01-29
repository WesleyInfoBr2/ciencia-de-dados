import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react'

interface CalloutComponentProps {
  node: any
  updateAttributes: (attrs: Record<string, any>) => void
}

const CalloutComponent = ({ node, updateAttributes }: CalloutComponentProps) => {
  const variant = node.attrs.variant || 'info'
  const emoji = node.attrs.emoji

  const icons = {
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    tip: <Lightbulb className="h-5 w-5" />,
  }

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
    success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
    error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
    tip: 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100',
  }

  const iconColors = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    error: 'text-red-500',
    tip: 'text-purple-500',
  }

  return (
    <NodeViewWrapper 
      className={`callout-wrapper rounded-lg border-l-4 p-4 my-4 ${colors[variant as keyof typeof colors] || colors.info}`}
      data-variant={variant}
    >
      <div className="flex items-start gap-3">
        <div className={`callout-icon flex-shrink-0 mt-0.5 ${iconColors[variant as keyof typeof iconColors] || iconColors.info}`}>
          {emoji ? <span className="text-xl">{emoji}</span> : (icons[variant as keyof typeof icons] || icons.info)}
        </div>
        <div className="callout-content flex-1 prose prose-sm max-w-none [&>p]:m-0 [&>p:first-child]:mt-0">
          <NodeViewContent className="callout-inner" />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default CalloutComponent
