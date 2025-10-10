import { useEditor, EditorContent } from '@tiptap/react'
import { wikiBaseExtensions } from '@/lib/wiki/extensions'

const SAMPLE = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Smoke Test' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Parágrafo normal.' }] },
    { type: 'bulletList', content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }] },
    ]},
    { type: 'codeBlock', attrs: { language: 'python' }, content: [{ type: 'text', text: 'print(42)' }] },
    { type: 'mathBlock', attrs: { latex: '\\int_0^1 x^2 dx' } },
  ],
}

export default function DevTiptap() {
  const editor = useEditor({
    editable: true,
    content: SAMPLE,
    extensions: wikiBaseExtensions('Digite / para comandos…'),
    editorProps: { attributes: { class: 'prose max-w-none p-4 border rounded [&_*]:text-inherit' } },
    onCreate: ({ editor }) => {
      console.log('[SMOKE] getHTML =', editor.getHTML())
    }
  })

  if (!editor) return null
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Se abaixo aparecer vazio, há problema global (CSS/sanitização/pacote).</div>
      <EditorContent editor={editor} />
    </div>
  )
}
