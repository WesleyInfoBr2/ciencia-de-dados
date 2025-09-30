import { NodeViewWrapper } from '@tiptap/react'
import { GripVertical } from 'lucide-react'

interface DragHandleProps {
  children: React.ReactNode
  onDragStart?: () => void
}

export const DragHandle = ({ children, onDragStart }: DragHandleProps) => {
  return (
    <NodeViewWrapper className="drag-handle-wrapper">
      <div className="drag-handle-container">
        <button
          className="drag-handle-button"
          draggable="true"
          onDragStart={onDragStart}
          contentEditable={false}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="drag-handle-content">
          {children}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
