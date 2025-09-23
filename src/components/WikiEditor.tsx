import React, { useMemo, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics'
import { common } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

import 'katex/dist/katex.min.css'

type WikiEditorProps = {
  initialContent?: any               // ProseMirror JSON (recomendado)
  onSave?: (docJSON: any) => Promise<void> | void  // Optional save callback
  onChange?: (docJSON: any) => void  // Real-time content updates
  uploading?: boolean
  onUploadImage?: (file: File) => Promise<string> // deve retornar URL pública
}

// For now, we'll use the built-in math input rules from the Mathematics extension
// instead of custom input rules

export default function WikiEditor({ initialContent, onSave, onChange, uploading, onUploadImage }: WikiEditorProps) {
  const [saving, setSaving] = useState(false)

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      codeBlock: false, // usaremos CodeBlockLowlight
    }),
    Link.configure({ openOnClick: true, autolink: true }),
    Image.extend({
      addAttributes() {
        return {
          src: { default: null },
          alt: { default: null },
          title: { default: null },
          width: { default: null },
          height: { default: null },
        }
      },
    }),
    CodeBlockLowlight.configure({ lowlight: common }),
    Table.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    TaskList, TaskItem.configure({ nested: true }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
  ], [])

  const editor = useEditor({
    extensions,
    content: initialContent ?? {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }]}],
    },
    autofocus: 'end',
    onCreate: ({ editor }) => {
      // Automatically migrate math strings $...$ and $$...$$ to math nodes
      migrateMathStrings(editor)
    },
    onUpdate: ({ editor }) => {
      // Migrate new math strings when content changes
      migrateMathStrings(editor)
      // Call onChange for real-time updates
      onChange?.(editor.getJSON())
    },
    editorProps: {
      attributes: { class: 'prose prose-neutral max-w-none focus:outline-none' },
    },
  })

  const handleSave = async () => {
    if (!editor) return
    try {
      setSaving(true)
      const json = editor.getJSON()        // <- salve JSON, não HTML
      await onSave(json)
    } finally {
      setSaving(false)
    }
  }

  const insertImage = async (file: File) => {
    if (!editor || !onUploadImage) return
    const url = await onUploadImage(file)
    editor.chain().focus().setImage({ src: url, alt: file.name }).run()
  }

  return (
    <div className="space-y-3">
      {/* Toolbar simples */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border p-2">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-black text-white' : 'bg-gray-100'}`}>B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-black text-white' : 'bg-gray-100'}`}>I</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        {[1,2,3].map(l => (
          <button key={l} onClick={() => editor?.chain().focus().toggleHeading({ level: l as 1 | 2 | 3 }).run()}
            className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: l }) ? 'bg-black text-white' : 'bg-gray-100'}`}>
            H{l}
          </button>
        ))}
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-black text-white' : 'bg-gray-100'}`}>• Lista</button>
        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-black text-white' : 'bg-gray-100'}`}>1. Lista</button>
        <button onClick={() => editor?.chain().focus().toggleTaskList().run()} className={`px-2 py-1 rounded ${editor?.isActive('taskList') ? 'bg-black text-white' : 'bg-gray-100'}`}>☑︎ Tarefas</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 rounded ${editor?.isActive('codeBlock') ? 'bg-black text-white' : 'bg-gray-100'}`}>{`</>`}</button>
        <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="px-2 py-1 rounded bg-gray-100">─</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        {/* Matemática: digite $...$ (inline) ou $$...$$ (bloco) diretamente */}
        <span className="text-sm text-gray-500">Math: use $...$ ou $$...$$</span>
        <div className="ml-auto flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1 rounded bg-gray-100">
            Imagem
            <input type="file" className="hidden" accept="image/*"
              onChange={(e) => e.target.files && insertImage(e.target.files[0])}/>
          </label>
          <button onClick={handleSave}
            disabled={saving || uploading}
            className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-60">
            {saving || uploading ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
