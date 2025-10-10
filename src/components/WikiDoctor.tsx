import React from 'react'
import type { Editor } from '@tiptap/react'
import { isPMDoc } from './normalizeWikiContent'

export function WikiDoctor({ raw, normalized, editor }:{
  raw: unknown; normalized: any; editor?: Editor | null
}) {
  const typ = typeof raw
  const okJson = isPMDoc(normalized)
  const names = editor?.extensionManager.extensions.map(e => e.name) || []
  const hasMath = names.some(n => ['mathematics','Mathematics','mathInline','inlineMath','mathBlock','blockMath'].includes(String(n)))
  const hasTable = names.includes('table')
  const hasStarter = names.includes('starterKit')

  const okCls = 'text-primary'
  const badCls = 'text-destructive'

  return (
    <div className="mt-3 rounded-lg border bg-muted p-3 text-sm text-foreground">
      <div className="font-medium">WikiDoctor</div>
      <div>raw typeof: <b>{typ}</b></div>
      <div>normalized is ProseMirror JSON: <b className={okJson ? okCls : badCls}>{okJson ? 'yes' : 'no'}</b></div>
      <div>extensions → math:{' '}
        <b className={hasMath ? okCls : badCls}>{String(hasMath)}</b>, table:{' '}
        <b className={hasTable ? okCls : badCls}>{String(hasTable)}</b>, starterKit:{' '}
        <b className={hasStarter ? okCls : badCls}>{String(hasStarter)}</b>
      </div>
      <pre className="mt-2 max-h-40 overflow-auto rounded bg-background p-2 text-xs">
        {JSON.stringify(
          typ === 'string' ? String(raw).slice(0, 300) : raw, null, 2)}
      </pre>
    </div>
  )
}
