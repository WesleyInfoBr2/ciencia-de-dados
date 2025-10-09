// normalizeWikiContent.ts
export type PMDoc = { type: 'doc'; content?: any[] }

export function isPMDoc(v: any): v is PMDoc {
  return v && typeof v === 'object' && v.type === 'doc'
}

export function normalizeWikiContent(input: unknown): PMDoc {
  // 1) já é JSON ProseMirror?
  if (isPMDoc(input)) return input
  // 2) veio string? tentar parsear
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      if (isPMDoc(parsed)) return parsed
      // 3) se for HTML simples, embrulha em parágrafo
      return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: stripHtml(parsed) }]}]}
    } catch {
      // 4) string não-JSON (provável HTML); converter pra texto puro
      return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: stripHtml(input) }]}]}
    }
  }
  // 5) nulo/indefinido → doc vazio
  return { type: 'doc', content: [] }
}

function stripHtml(s: any) {
  const txt = String(s ?? '')
  return txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
