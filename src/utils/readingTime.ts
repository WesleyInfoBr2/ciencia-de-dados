export function calculateReadingTime(content: any): number {
  if (!content) return 0
  
  // Convert Tiptap JSON to plain text
  const getText = (node: any): string => {
    if (node.type === 'text') {
      return node.text || ''
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(getText).join(' ')
    }
    
    return ''
  }
  
  const text = getText(content)
  const words = text.trim().split(/\s+/).length
  const wordsPerMinute = 200
  
  return Math.ceil(words / wordsPerMinute)
}
