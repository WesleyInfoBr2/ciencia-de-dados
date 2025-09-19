import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlock from '@tiptap/extension-code-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Mathematics from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'

interface TiptapViewerProps {
  content: any
  className?: string
}

export const TiptapViewer = ({ content, className }: TiptapViewerProps) => {
  if (!content) {
    return <div className={className}>Conteúdo não disponível</div>
  }

  // Generate HTML from ProseMirror JSON
  const html = generateHTML(content, [
    StarterKit,
    Link.configure({
      HTMLAttributes: {
        class: 'text-primary underline hover:text-primary/80',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg my-4',
      },
    }),
    Table.configure({
      HTMLAttributes: {
        class: 'border-collapse border border-border w-full my-4',
      },
    }),
    TableRow.configure({
      HTMLAttributes: {
        class: 'border-b border-border',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-border bg-muted p-2 text-left font-semibold',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-border p-2',
      },
    }),
    CodeBlock.configure({
      HTMLAttributes: {
        class: 'bg-muted p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
      },
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: 'list-none',
      },
    }),
    TaskItem.configure({
      HTMLAttributes: {
        class: 'flex items-start gap-2',
      },
    }),
    Mathematics,
  ])

  return (
    <div 
      className={`prose prose-lg max-w-none 
        prose-headings:text-foreground prose-headings:font-bold
        prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
        prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
        prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
        prose-p:text-foreground prose-p:leading-7
        prose-strong:text-foreground prose-strong:font-semibold
        prose-em:text-foreground/90
        prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
        prose-ul:list-disc prose-ul:ml-6
        prose-ol:list-decimal prose-ol:ml-6
        prose-li:text-foreground prose-li:my-1
        ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}