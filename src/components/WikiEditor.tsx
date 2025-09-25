import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight/lib/common'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import 'katex/dist/katex.min.css'

type WikiEditorProps = {
  initialContent?: any
  /** Salva publicação (botão Salvar) */
  onSave?: (docJSON: any) => Promise<void> | void
  /** Autosave (rascunho) – dispara após debounce */
  onAutoSave?: (docJSON: any) => Promise<void> | void
  /** Upload de imagem deve retornar URL pública/signed */
  onUploadImage?: (file: File) => Promise<string>
  uploading?: boolean
  /** Habilita alerta ao tentar sair com alterações não salvas */
  navigationGuard?: boolean
}

const MathInputRules = Mathematics.extend({
  addInputRules() {
    return [
      // inline: $...$
      this.editor.inputRule(/(?:^|[\s])\$(.+?)\$$/, ({ range, match }) => {
        const [, latex] = match
        this.editor.chain().deleteRange(range)
          .insertContent({ type: 'mathInline', attrs: { latex } }).run()
        return null
      }),
      // block: $$...$$
      this.editor.inputRule(/^\$\$(.+?)\$\$$/, ({ range, match }) => {
        const [, latex] = match
        this.editor.chain().deleteRange(range)
          .insertContent({ type: 'mathBlock', attrs: { latex } }).run()
        return null
      }),
    ]
  },
})

export default function WikiEditor({
  initialContent,
  onSave,
  onAutoSave,
  onUploadImage,
  uploading,
  navigationGuard = true,
}: WikiEditorProps) {
  const [saving, setSaving] = useState(false)
  const [lastDraftAt, setLastDraftAt] = useState<Date | null>(null)
  const dirtyRef = useRef(false)
  const autosaveTimer = useRef<number | null>(null)

  const extensions = useMemo(() => [
    StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false }),
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
    // estilos de texto
    TextStyle, Color, Underline, Highlight,
    // código com highlight
    CodeBlockLowlight.configure({ lowlight }),
    // tabela
    Table.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    // listas de tarefas
    TaskList, TaskItem.configure({ nested: true }),
    // matemática
    MathInputRules.configure({ katexOptions: { throwOnError: false } }),
  ], [])

  const editor = useEditor({
    extensions,
    content: initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    autofocus: 'end',
    onCreate: ({ editor }) => migrateMathStrings(editor),
    onUpdate: ({ editor }) => {
      migrateMathStrings(editor)
      dirtyRef.current = true
      // autosave (debounce 800ms)
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
      autosaveTimer.current = window.setTimeout(async () => {
        if (onAutoSave) {
          await onAutoSave(editor.getJSON())
          setLastDraftAt(new Date())
          dirtyRef.current = false
        }
      }, 800)
    },
    editorProps: {
      attributes: { class: 'prose prose-neutral max-w-none focus:outline-none' },
      handleKeyDown: (_view, event) => {
        // atalhos básicos
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
          event.preventDefault()
          handleSave()
          return true
        }
        return false
      },
    },
  })

  // Guard de navegação / unload
  useEffect(() => {
    if (!navigationGuard) return
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [navigationGuard])

  const handleSave = async () => {
    if (!editor || !onSave) return
    try {
      setSaving(true)
      await onSave(editor.getJSON())
      dirtyRef.current = false
      setLastDraftAt(null)
    } finally {
      setSaving(false)
    }
  }

  const insertImage = async (file: File) => {
    if (!editor || !onUploadImage) return
    const url = await onUploadImage(file)
    editor.chain().focus().setImage({ src: url, alt: file.name }).run()
  }

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const tableCmd = (cmd: () => void) => () => editor?.chain().focus() && cmd()

  return (
    <div className="space-y-3">
      {/* TOOLBAR */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-background/90 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-black text-white' : 'bg-gray-100'}`}>B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-black text-white' : 'bg-gray-100'}`}>I</button>
        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`px-2 py-1 rounded ${editor?.isActive('underline') ? 'bg-black text-white' : 'bg-gray-100'}`}>U</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        {[1,2,3].map(l => (
          <button key={l}
            onClick={() => editor?.chain().focus().toggleHeading({ level: l as 1|2|3 }).run()}
            className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: l }) ? 'bg-black text-white' : 'bg-gray-100'}`}>H{l}</button>
        ))}
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-black text-white' : 'bg-gray-100'}`}>• Lista</button>
        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-black text-white' : 'bg-gray-100'}`}>1. Lista</button>
        <button onClick={() => editor?.chain().focus().toggleTaskList().run()} className={`px-2 py-1 rounded ${editor?.isActive('taskList') ? 'bg-black text-white' : 'bg-gray-100'}`}>☑︎ Tarefas</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 rounded ${editor?.isActive('codeBlock') ? 'bg-black text-white' : 'bg-gray-100'}`}>{`</>`}</button>
        <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="px-2 py-1 rounded bg-gray-100">─</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        {/* TABLE */}
        <button onClick={insertTable} className="px-2 py-1 rounded bg-gray-100">Tabela 3×3</button>
        <div className="flex gap-1">
          <button onClick={tableCmd(() => editor!.chain().addColumnBefore().run())} className="px-2 py-1 rounded bg-gray-100">+ Col ←</button>
          <button onClick={tableCmd(() => editor!.chain().addColumnAfter().run())} className="px-2 py-1 rounded bg-gray-100">+ Col →</button>
          <button onClick={tableCmd(() => editor!.chain().addRowBefore().run())} className="px-2 py-1 rounded bg-gray-100">+ Linha ↑</button>
          <button onClick={tableCmd(() => editor!.chain().addRowAfter().run())} className="px-2 py-1 rounded bg-gray-100">+ Linha ↓</button>
          <button onClick={tableCmd(() => editor!.chain().toggleHeaderRow().run())} className="px-2 py-1 rounded bg-gray-100">Header</button>
          <button onClick={tableCmd(() => editor!.chain().mergeCells().run())} className="px-2 py-1 rounded bg-gray-100">Mesclar</button>
          <button onClick={tableCmd(() => editor!.chain().deleteTable().run())} className="px-2 py-1 rounded bg-gray-100 text-red-600">Del</button>
        </div>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        {/* COLORS / HIGHLIGHT */}
        <input
          type="color"
          onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
          className="h-8 w-10 rounded border"
          title="Cor do texto"
          aria-label="Cor do texto"
        />
        <button onClick={() => editor?.chain().focus().toggleHighlight().run()} className={`px-2 py-1 rounded ${editor?.isActive('highlight') ? 'bg-black text-white' : 'bg-gray-100'}`}>Sublinhar</button>

        <div className="ml-auto flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1 rounded bg-gray-100">
            Imagem
            <input type="file" className="hidden" accept="image/*"
              onChange={(e) => e.target.files && insertImage(e.target.files[0])}/>
          </label>
          <button onClick={handleSave}
            type="button"
            disabled={saving || uploading}
            className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-60">
            {saving || uploading ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border p-3">
        <EditorContent editor={editor} />
        {lastDraftAt && (
          <div className="mt-2 text-xs text-muted-foreground">
            Rascunho salvo às {lastDraftAt.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}

