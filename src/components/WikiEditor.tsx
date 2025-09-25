import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics'
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
  // Simplified without inputRule API
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
  const [showTableOptions, setShowTableOptions] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const dirtyRef = useRef(false)
  const autosaveTimer = useRef<number | null>(null)

  const extensions = useMemo(() => {
    const lowlight = createLowlight()
    return [
      StarterKit.configure({ 
        heading: { levels: [1, 2, 3] }, 
        codeBlock: false,
        link: false // disable to avoid duplicate
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
    ]
  }, [])

  const editor = useEditor({
    extensions,
    content: initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    autofocus: 'end',
    onCreate: ({ editor }) => migrateMathStrings(editor),
    onUpdate: ({ editor, transaction }) => {
      // Only migrate math strings if there were actual content changes (not just selection changes)
      if (transaction.docChanged) {
        setTimeout(() => migrateMathStrings(editor), 0)
        dirtyRef.current = true
        
        // autosave (debounce 1500ms to avoid interference with formatting)
        if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
        autosaveTimer.current = window.setTimeout(async () => {
          if (onAutoSave && dirtyRef.current) {
            try {
              await onAutoSave(editor.getJSON())
              setLastDraftAt(new Date())
              dirtyRef.current = false
            } catch (error) {
              console.error('Auto save error:', error)
            }
          }
        }, 1500)
      }
    },
    editorProps: {
      attributes: { class: 'prose prose-neutral max-w-none focus:outline-none tiptap-content' },
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.table-options-dropdown')) {
        setShowTableOptions(false)
      }
    }

    if (showTableOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTableOptions])

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

  const insertTable = (rows: number = tableRows, cols: number = tableCols) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setShowTableOptions(false)
  }

  const setBorderStyle = (style: string) => {
    editor?.chain().focus().run()
    // Apply border style to selected table
    if (editor?.isActive('table')) {
      const tableElement = document.querySelector('.ProseMirror table')
      if (tableElement) {
        switch (style) {
          case 'thin':
            (tableElement as HTMLElement).style.border = '1px solid hsl(var(--border))'
            break
          case 'thick':
            (tableElement as HTMLElement).style.border = '2px solid hsl(var(--border))'
            break
          case 'dashed':
            (tableElement as HTMLElement).style.border = '1px dashed hsl(var(--border))'
            break
          case 'none':
            (tableElement as HTMLElement).style.border = 'none'
            break
        }
      }
    }
  }

  const tableCmd = (cmd: () => void) => () => editor?.chain().focus() && cmd()

  return (
    <div className="space-y-3">
      {/* TOOLBAR */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-background/90 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-black text-white' : 'bg-gray-100'}`}>B</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-black text-white' : 'bg-gray-100'}`}>I</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`px-2 py-1 rounded ${editor?.isActive('underline') ? 'bg-black text-white' : 'bg-gray-100'}`}>U</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        {[1,2,3].map(l => (
          <button key={l}
            type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: l as 1|2|3 }).run()}
            className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: l }) ? 'bg-black text-white' : 'bg-gray-100'}`}>H{l}</button>
        ))}
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-black text-white' : 'bg-gray-100'}`}>• Lista</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-black text-white' : 'bg-gray-100'}`}>1. Lista</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleTaskList().run()} className={`px-2 py-1 rounded ${editor?.isActive('taskList') ? 'bg-black text-white' : 'bg-gray-100'}`}>☑︎ Tarefas</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 rounded ${editor?.isActive('codeBlock') ? 'bg-black text-white' : 'bg-gray-100'}`}>{`</>`}</button>
        <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="px-2 py-1 rounded bg-gray-100">─</button>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        {/* TABLE */}
        <div className="relative table-options-dropdown">
          <button 
            type="button" 
            onClick={() => setShowTableOptions(!showTableOptions)} 
            className="px-2 py-1 rounded bg-gray-100"
          >
            Tabela ▼
          </button>
          {showTableOptions && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded-lg shadow-lg z-50 min-w-64">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Tamanho:</label>
                  <div className="flex gap-2 mt-1">
                    <div>
                      <label className="text-xs">Linhas:</label>
                      <input 
                        type="number" 
                        min="2" 
                        max="10" 
                        value={tableRows}
                        onChange={(e) => setTableRows(Number(e.target.value))}
                        className="w-16 px-1 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs">Colunas:</label>
                      <input 
                        type="number" 
                        min="2" 
                        max="10" 
                        value={tableCols}
                        onChange={(e) => setTableCols(Number(e.target.value))}
                        className="w-16 px-1 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => insertTable()}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Inserir Tabela {tableRows}×{tableCols}
                </button>
                {editor?.isActive('table') && (
                  <div>
                    <label className="text-sm font-medium">Bordas:</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <button type="button" onClick={() => setBorderStyle('thin')} className="px-2 py-1 text-xs bg-gray-100 rounded">Fina</button>
                      <button type="button" onClick={() => setBorderStyle('thick')} className="px-2 py-1 text-xs bg-gray-100 rounded">Grossa</button>
                      <button type="button" onClick={() => setBorderStyle('dashed')} className="px-2 py-1 text-xs bg-gray-100 rounded">Tracejada</button>
                      <button type="button" onClick={() => setBorderStyle('none')} className="px-2 py-1 text-xs bg-gray-100 rounded">Sem borda</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={tableCmd(() => editor!.chain().addColumnBefore().run())} className="px-2 py-1 rounded bg-gray-100">+ Col ←</button>
          <button type="button" onClick={tableCmd(() => editor!.chain().addColumnAfter().run())} className="px-2 py-1 rounded bg-gray-100">+ Col →</button>
          <button type="button" onClick={tableCmd(() => editor!.chain().addRowBefore().run())} className="px-2 py-1 rounded bg-gray-100">+ Linha ↑</button>
          <button type="button" onClick={tableCmd(() => editor!.chain().addRowAfter().run())} className="px-2 py-1 rounded bg-gray-100">+ Linha ↓</button>
          <button type="button" onClick={tableCmd(() => editor!.chain().toggleHeaderRow().run())} className="px-2 py-1 rounded bg-gray-100">Header</button>
          <button type="button" onClick={tableCmd(() => editor!.chain().mergeCells().run())} className="px-2 py-1 rounded bg-gray-100">Mesclar</button>
          <button type="button" onClick={tableCmd(() => editor!.chain().deleteTable().run())} className="px-2 py-1 rounded bg-gray-100 text-red-600">Del</button>
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
        <button type="button" onClick={() => editor?.chain().focus().toggleHighlight().run()} className={`px-2 py-1 rounded ${editor?.isActive('highlight') ? 'bg-black text-white' : 'bg-gray-100'}`}>Destacar</button>

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


