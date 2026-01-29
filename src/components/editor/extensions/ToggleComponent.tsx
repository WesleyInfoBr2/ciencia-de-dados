import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ToggleComponentProps {
  node: any
  updateAttributes: (attrs: Record<string, any>) => void
}

const ToggleComponent = ({ node, updateAttributes }: ToggleComponentProps) => {
  const [isOpen, setIsOpen] = useState(node.attrs.open || false)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    updateAttributes({ open: newState })
  }

  return (
    <NodeViewWrapper className="toggle-wrapper my-2 border rounded-lg bg-muted/30">
      <button
        type="button"
        onClick={handleToggle}
        className="toggle-header w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        <ChevronRight 
          className={`h-4 w-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} 
        />
        <span className="font-medium text-sm">
          {node.attrs.summary || 'Clique para expandir'}
        </span>
      </button>
      
      {isOpen && (
        <div className="toggle-content px-4 pb-3 pt-1 prose prose-sm max-w-none [&>p]:m-0">
          <NodeViewContent className="toggle-inner" />
        </div>
      )}
    </NodeViewWrapper>
  )
}

export default ToggleComponent
