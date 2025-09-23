import React, { useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mathematics from '@tiptap/extension-mathematics'
import CodeBlock from '@tiptap/extension-code-block'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { generateHTML } from '@tiptap/html'
import DOMPurify from 'dompurify'

import 'katex/dist/katex.min.css'

type WikiViewerProps = {
  content: any // ProseMirror JSON salvo no banco
  mode?: 'tiptap' | 'html' // padrão: 'tiptap'
}

const extensionsList = [
  StarterKit.configure({ codeBlock: false }),
  Link.configure({ openOnClick: true }),
  Image,
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'rounded-lg bg-gray-100 p-4 font-mono text-sm',
    },
  }),
  Table.configure({ resizable: true }),
  TableRow, TableHeader, TableCell,
  TaskList, TaskItem.configure({ nested: true }),
  Mathematics.configure({ katexOptions: { throwOnError: false } }),
]

export default function WikiViewer({ content, mode = 'tiptap' }: WikiViewerProps) {
  if (mode === 'html') {
    // ---- B) Gerar HTML (útil para SSR/SEO) ----
    const raw = generateHTML(content, extensionsList)
    const clean = DOMPurify.sanitize(raw, {
      ADD_TAGS: [
        'math','mrow','mi','mo','mn','msup','mfrac','msqrt','mtable','mtr','mtd',
        'semantics','annotation','span'
      ],
      ADD_ATTR: ['class','style','aria-hidden','role','display','xmlns']
    })
    return <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />
  }

  // ---- A) Tiptap read-only ----
  const editor = useEditor({
    editable: false,
    content,
    extensions: extensionsList,
    editorProps: {
      attributes: { class: 'prose prose-neutral max-w-none' },
    },
  })

  if (!editor) return null
  return <EditorContent editor={editor} />
}
