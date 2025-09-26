import React from 'react'
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
import { FontFamily } from '@tiptap/extension-font-family'
import { TextAlign } from '@tiptap/extension-text-align'
import { generateHTML } from '@tiptap/html'
import DOMPurify from 'dompurify'
import 'katex/dist/katex.min.css'

type WikiViewerProps = {
  content: any
  mode?: 'tiptap' | 'html'
}

const extensionsList = (() => {
  const lowlight = createLowlight()
  return [
    StarterKit.configure({ 
      codeBlock: false,
      link: false, // disable to avoid duplicate
      underline: false // disable to avoid duplicate - will add it explicitly
    }),
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
          },
        }
      },
    }),
    TextStyle, 
    Color, 
    FontFamily,
    Underline, // Explicitly add to avoid duplication warning
    Highlight,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    TaskList, TaskItem.configure({ nested: true }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
  ]
})()

export default function WikiViewer({ content, mode = 'tiptap' }: WikiViewerProps) {
  if (mode === 'html') {
    const raw = generateHTML(content, extensionsList)
    const clean = DOMPurify.sanitize(raw, {
      ADD_TAGS: [
        'math','mrow','mi','mo','mn','msup','mfrac','msqrt','mtable','mtr','mtd',
        'semantics','annotation','span'
      ],
      ADD_ATTR: ['class','style','aria-hidden','role','display','xmlns','data-align','data-text-align']
    })
    return (
      <div className="wiki-viewer prose prose-neutral max-w-none">
        <div dangerouslySetInnerHTML={{ __html: clean }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* WikiViewer específico styles */
            .wiki-viewer [data-align="left"] {
              text-align: left;
            }
            .wiki-viewer [data-align="center"] {
              text-align: center;
            }
            .wiki-viewer [data-align="right"] {
              text-align: right;
            }
            .wiki-viewer img[data-align="left"] {
              float: left;
              margin: 0 1rem 1rem 0;
            }
            .wiki-viewer img[data-align="center"] {
              display: block;
              margin: 1rem auto;
            }
            .wiki-viewer img[data-align="right"] {
              float: right;
              margin: 0 0 1rem 1rem;
            }
            .wiki-viewer table {
              border-collapse: collapse;
              width: 100%;
              margin: 1rem 0;
              border: 1px solid hsl(var(--border));
            }
            .wiki-viewer th, .wiki-viewer td {
              border: 1px solid hsl(var(--border));
              padding: 0.5rem;
              text-align: left;
            }
            .wiki-viewer th {
              background-color: hsl(var(--muted));
              font-weight: 600;
            }
            .wiki-viewer ul[data-type="taskList"] {
              list-style: none;
              padding-left: 0;
            }
            .wiki-viewer li[data-type="taskItem"] {
              display: flex;
              align-items: flex-start;
              gap: 0.5rem;
            }
            .wiki-viewer pre {
              background-color: hsl(var(--muted));
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1rem 0;
            }
            .wiki-viewer code {
              background-color: hsl(var(--muted));
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              font-family: monospace;
            }
            .wiki-viewer pre code {
              background: none;
              padding: 0;
            }
          `
        }} />
      </div>
    )
  }

  const editor = useEditor({
    editable: false,
    content,
    extensions: extensionsList,
    editorProps: { 
      attributes: { 
        class: 'wiki-viewer prose prose-neutral max-w-none' 
      } 
    },
  })

  if (!editor) return null
  return (
    <>
      <EditorContent editor={editor} />
      <style dangerouslySetInnerHTML={{
        __html: `
          /* WikiViewer EditorContent styles */
          .wiki-viewer [data-align="left"] {
            text-align: left;
          }
          .wiki-viewer [data-align="center"] {
            text-align: center;
          }
          .wiki-viewer [data-align="right"] {
            text-align: right;
          }
          .wiki-viewer img[data-align="left"] {
            float: left;
            margin: 0 1rem 1rem 0;
          }
          .wiki-viewer img[data-align="center"] {
            display: block;
            margin: 1rem auto;
          }
          .wiki-viewer img[data-align="right"] {
            float: right;
            margin: 0 0 1rem 1rem;
          }
          .wiki-viewer table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
            border: 1px solid hsl(var(--border));
          }
          .wiki-viewer th, .wiki-viewer td {
            border: 1px solid hsl(var(--border));
            padding: 0.5rem;
            text-align: left;
          }
          .wiki-viewer th {
            background-color: hsl(var(--muted));
            font-weight: 600;
          }
          .wiki-viewer ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
          }
          .wiki-viewer li[data-type="taskItem"] {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .wiki-viewer pre {
            background-color: hsl(var(--muted));
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
          }
          .wiki-viewer code {
            background-color: hsl(var(--muted));
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            font-family: monospace;
          }
          .wiki-viewer pre code {
            background: none;
            padding: 0;
          }
        `
      }} />
    </>
  )
}

