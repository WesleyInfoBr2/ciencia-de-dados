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
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics'
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
  // Para garantir que fórmulas $...$ e $$...$$ sejam convertidas corretamente
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
        class: 'my-4',
      },
    }),
    TaskItem.configure({
      HTMLAttributes: {
        class: 'flex items-start gap-2 my-1',
      },
    }),
    Mathematics.configure({
      katexOptions: {
        throwOnError: false,
        displayMode: false,
      },
    }),
  ])

  return (
    <div className={`tiptap-viewer max-w-none ${className || ''}`}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      
      {/* CSS for viewer styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .tiptap-viewer .katex-display {
            margin: 1rem 0;
            text-align: center;
          }
          .tiptap-viewer .katex {
            font-size: 1.1em;
          }
          /* Math display and inline styles */
          .tiptap-viewer math-display {
            display: block;
            margin: 1rem 0;
            text-align: center;
          }
          .tiptap-viewer math-inline {
            display: inline;
          }
          /* Ensure math content is visible */
          .tiptap-viewer [data-type="mathematics"] {
            display: inline-block;
            margin: 0 2px;
          }
          .tiptap-viewer [data-type="mathematics"][data-display="true"] {
            display: block;
            margin: 1rem 0;
            text-align: center;
          }
          .tiptap-viewer {
            color: hsl(var(--foreground));
            line-height: 1.7;
          }
          .tiptap-viewer h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 1.5rem 0 0.75rem 0;
            color: hsl(var(--foreground));
          }
          .tiptap-viewer h2 {
            font-size: 14px;
            font-weight: bold;
            margin: 1.25rem 0 0.5rem 0;
            color: hsl(var(--foreground));
          }
          .tiptap-viewer h3 {
            font-size: inherit;
            font-weight: bold;
            margin: 1rem 0 0.5rem 0;
            color: hsl(var(--foreground));
          }
          .tiptap-viewer p {
            margin: 0.75rem 0;
            color: hsl(var(--foreground));
          }
          .tiptap-viewer ul {
            list-style-type: disc;
            margin-left: 1.5rem;
            margin: 1rem 0;
          }
          .tiptap-viewer ol {
            list-style-type: decimal;
            margin-left: 1.5rem;
            margin: 1rem 0;
          }
          .tiptap-viewer li {
            margin: 0.25rem 0;
            color: hsl(var(--foreground));
          }
          .tiptap-viewer a {
            color: hsl(var(--primary));
            text-decoration: underline;
          }
          .tiptap-viewer a:hover {
            color: hsl(var(--primary) / 0.8);
          }
          .tiptap-viewer strong {
            font-weight: 600;
            color: hsl(var(--foreground));
          }
          .tiptap-viewer em {
            font-style: italic;
            color: hsl(var(--foreground) / 0.9);
          }
          .tiptap-viewer blockquote {
            border-left: 4px solid hsl(var(--primary));
            padding-left: 1rem;
            font-style: italic;
            color: hsl(var(--muted-foreground));
            margin: 1rem 0;
          }
          .tiptap-viewer code {
            background-color: hsl(var(--muted));
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            font-family: monospace;
          }
          .tiptap-viewer pre {
            background-color: hsl(var(--muted));
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
          }
          .tiptap-viewer pre code {
            background: none;
            padding: 0;
            border-radius: 0;
          }
          .tiptap-viewer img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
          }
          .tiptap-viewer table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
            border: 1px solid hsl(var(--border));
          }
          .tiptap-viewer th, .tiptap-viewer td {
            border: 1px solid hsl(var(--border));
            padding: 0.5rem;
            text-align: left;
          }
           .tiptap-viewer th {
             background-color: hsl(var(--muted));
             font-weight: 600;
           }
           /* Tiptap Mathematics extension styles */
           .tiptap-viewer .tiptap-mathematics-render {
             display: inline-block;
             margin: 0 2px;
           }
           .tiptap-viewer .tiptap-mathematics-render[data-type="block-math"] {
             display: block;
             margin: 1rem 0;
             text-align: center;
           }
           .tiptap-viewer .tiptap-mathematics-render[data-type="inline-math"] {
             display: inline;
           }
        `
      }} />
    </div>
  )
}