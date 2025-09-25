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
      link: false // disable to avoid duplicate
    }),
    Link.configure({ openOnClick: true }),
    Image,
    TextStyle, Color, Underline, Highlight,
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
      ADD_ATTR: ['class','style','aria-hidden','role','display','xmlns']
    })
    return <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />
  }

  const editor = useEditor({
    editable: false,
    content,
    extensions: extensionsList,
    editorProps: { attributes: { class: 'prose prose-neutral max-w-none' } },
  })

  if (!editor) return null
  return <EditorContent editor={editor} />
}

