import { generateHTML } from '@tiptap/html'
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
import { FontFamily } from '@tiptap/extension-font-family'
import { TextAlign } from '@tiptap/extension-text-align'
import { Callout } from './editor/extensions/Callout'
import { Toggle } from './editor/extensions/Toggle'
import DOMPurify from 'dompurify'
import 'katex/dist/katex.min.css'
import { useMemo } from 'react'
import { calculateReadingTime } from '@/utils/readingTime'

interface WikiViewerV2Props {
  content: any
  icon?: string
  coverImage?: string
  title?: string
  author?: string
  publishedAt?: string
  tags?: string[]
  className?: string
}

const extensionsList = (() => {
  const lowlight = createLowlight()
  return [
    StarterKit,
    Link.configure({ openOnClick: true }),
    Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          align: {
            default: null,
            parseHTML: element => element.getAttribute('data-align'),
            renderHTML: attributes => {
              if (!attributes.align) return {}
              return { 'data-align': attributes.align }
            }
          }
        }
      }
    }),
    TextStyle,
    Color,
    FontFamily,
    Underline,
    Highlight,
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
    Callout,
    Toggle
  ]
})()

export default function WikiViewerV2({
  content,
  icon,
  coverImage,
  title,
  author,
  publishedAt,
  tags,
  className
}: WikiViewerV2Props) {
  const readingTime = useMemo(() => calculateReadingTime(content), [content])

  const html = useMemo(() => {
    if (!content) return ''

    const raw = generateHTML(content, extensionsList)
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: [
        'math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'mfrac', 'msqrt', 
        'mtable', 'mtr', 'mtd', 'semantics', 'annotation', 'span',
        'details', 'summary'
      ],
      ADD_ATTR: [
        'class', 'style', 'aria-hidden', 'role', 'display', 'xmlns',
        'data-align', 'data-text-align', 'data-type', 'data-variant',
        'data-emoji', 'data-open', 'data-summary', 'open'
      ]
    })
  }, [content])

  return (
    <article className={`wiki-viewer-v2 ${className || ''}`}>
      {/* Capa */}
      {coverImage && (
        <div className="wiki-cover">
          <img src={coverImage} alt={title} loading="lazy" />
        </div>
      )}

      {/* Cabeçalho */}
      <header className="wiki-header">
        {icon && <div className="wiki-icon">{icon}</div>}
        {title && <h1 className="wiki-title">{title}</h1>}
        
        {/* Metadados */}
        <div className="wiki-meta">
          {author && <span className="wiki-author">{author}</span>}
          {publishedAt && (
            <span className="wiki-date">
              {new Date(publishedAt).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
          {readingTime > 0 && (
            <span className="wiki-reading-time">{readingTime} min de leitura</span>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="wiki-tags">
            {tags.map((tag, index) => (
              <span key={index} className="wiki-tag">{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* Conteúdo */}
      <div 
        className="wiki-content prose prose-neutral max-w-[72ch] mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .wiki-viewer-v2 {
            width: 100%;
          }

          .wiki-cover {
            width: 100%;
            max-height: 400px;
            overflow: hidden;
            margin-bottom: 2rem;
            border-radius: 0.75rem;
          }

          .wiki-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .wiki-header {
            max-width: 72ch;
            margin: 0 auto 3rem;
            padding: 0 1rem;
          }

          .wiki-icon {
            font-size: 4rem;
            line-height: 1;
            margin-bottom: 1rem;
          }

          .wiki-title {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
            color: hsl(var(--foreground));
          }

          .wiki-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
            margin-bottom: 1rem;
          }

          .wiki-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .wiki-tag {
            padding: 0.25rem 0.75rem;
            background: hsl(var(--muted));
            border-radius: 9999px;
            font-size: 0.875rem;
            color: hsl(var(--foreground));
          }

          .wiki-content {
            padding: 0 1rem;
            line-height: 1.75;
            font-size: 17px;
          }

          .wiki-content h1,
          .wiki-content h2,
          .wiki-content h3 {
            scroll-margin-top: 100px;
          }

          .wiki-content h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }

          .wiki-content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 2.5rem;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid hsl(var(--border));
          }

          .wiki-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
          }

          .wiki-content p {
            margin-bottom: 1rem;
          }

          .wiki-content ul,
          .wiki-content ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
          }

          .wiki-content ul {
            list-style-type: disc;
          }

          .wiki-content ol {
            list-style-type: decimal;
          }

          .wiki-content li {
            margin-bottom: 0.5rem;
          }

          .wiki-content ul ul {
            list-style-type: circle;
          }

          .wiki-content ol ol {
            list-style-type: lower-alpha;
          }

          .wiki-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.75rem;
            margin: 1.5rem 0;
          }

          .wiki-content img[data-align="left"] {
            float: left;
            margin: 0 1rem 1rem 0;
            max-width: 50%;
          }

          .wiki-content img[data-align="center"] {
            display: block;
            margin: 1.5rem auto;
          }

          .wiki-content img[data-align="right"] {
            float: right;
            margin: 0 0 1rem 1rem;
            max-width: 50%;
          }

          .wiki-content table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 1.5rem 0;
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            overflow: hidden;
          }

          .wiki-content th,
          .wiki-content td {
            border: 1px solid hsl(var(--border));
            padding: 0.75rem;
            text-align: left;
          }

          .wiki-content th {
            background: hsl(var(--muted));
            font-weight: 600;
          }

          .wiki-content ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
          }

          .wiki-content li[data-type="taskItem"] {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .wiki-content pre {
            background: hsl(var(--muted));
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
          }

          .wiki-content code {
            background: hsl(var(--muted));
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
            font-family: 'Fira Code', monospace;
          }

          .wiki-content pre code {
            background: none;
            padding: 0;
          }

          .wiki-content blockquote {
            border-left: 4px solid hsl(var(--primary));
            padding-left: 1rem;
            font-style: italic;
            color: hsl(var(--muted-foreground));
            margin: 1.5rem 0;
          }

          .wiki-content .callout {
            padding: 1rem;
            border-radius: 0.75rem;
            margin: 1.5rem 0;
            display: flex;
            gap: 0.75rem;
          }

          .wiki-content .callout[data-variant="info"] {
            background: hsl(220 60% 95%);
            border-left: 4px solid hsl(220 80% 50%);
          }

          .wiki-content .callout[data-variant="success"] {
            background: hsl(140 60% 95%);
            border-left: 4px solid hsl(140 80% 40%);
          }

          .wiki-content .callout[data-variant="warning"] {
            background: hsl(40 60% 95%);
            border-left: 4px solid hsl(40 80% 50%);
          }

          .wiki-content .callout[data-variant="error"] {
            background: hsl(0 60% 95%);
            border-left: 4px solid hsl(0 80% 50%);
          }

          .wiki-content .callout-emoji {
            font-size: 1.5rem;
            flex-shrink: 0;
          }

          .wiki-content .callout-content {
            flex: 1;
          }

          .wiki-content .toggle-block {
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
          }

          .wiki-content .toggle-summary {
            font-weight: 600;
            cursor: pointer;
            user-select: none;
          }

          .wiki-content .toggle-content {
            margin-top: 0.75rem;
          }

          @media (prefers-color-scheme: dark) {
            .wiki-content .callout[data-variant="info"] {
              background: hsl(220 30% 15%);
            }
            .wiki-content .callout[data-variant="success"] {
              background: hsl(140 30% 15%);
            }
            .wiki-content .callout[data-variant="warning"] {
              background: hsl(40 30% 15%);
            }
            .wiki-content .callout[data-variant="error"] {
              background: hsl(0 30% 15%);
            }
          }
        `
      }} />
    </article>
  )
}
