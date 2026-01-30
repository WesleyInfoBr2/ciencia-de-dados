import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { ExternalLink } from 'lucide-react'

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (mimetype?: string): string => {
  if (!mimetype) return '📎'
  if (mimetype.startsWith('application/pdf')) return '📕'
  if (mimetype.startsWith('application/vnd.ms-excel') || 
      mimetype.includes('spreadsheet') ||
      mimetype.includes('csv')) return '📊'
  if (mimetype.startsWith('application/vnd.ms-powerpoint') ||
      mimetype.includes('presentation')) return '📽️'
  if (mimetype.startsWith('application/msword') ||
      mimetype.includes('document')) return '📄'
  if (mimetype.startsWith('text/')) return '📝'
  if (mimetype.startsWith('audio/')) return '🎵'
  if (mimetype.startsWith('video/')) return '🎬'
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return '🗜️'
  return '📎'
}

export function FileAttachmentComponent({ node }: NodeViewProps) {
  const { url, filename, filesize, mimetype } = node.attrs as {
    url: string
    filename: string
    filesize?: number
    mimetype?: string
  }
  const sizeText = formatFileSize(filesize)
  const icon = getFileIcon(mimetype)

  return (
    <NodeViewWrapper className="file-attachment-wrapper my-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="file-attachment-link flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors group max-w-md"
        contentEditable={false}
      >
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {filename}
          </div>
          {sizeText && (
            <div className="text-xs text-muted-foreground">
              {sizeText}
            </div>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </a>
    </NodeViewWrapper>
  )
}
