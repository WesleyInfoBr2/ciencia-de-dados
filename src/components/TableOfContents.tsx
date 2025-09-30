import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

export const TableOfContents = ({ content, className }: { content: any; className?: string }) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!content) return

    // Extract headings from Tiptap JSON
    const extractedHeadings: Heading[] = []
    
    const extractHeadings = (node: any) => {
      if (node.type === 'heading' && node.content) {
        const text = node.content.map((n: any) => n.text || '').join('')
        const id = text.toLowerCase().replace(/[^\w]+/g, '-')
        extractedHeadings.push({
          id,
          text,
          level: node.attrs.level
        })
      }
      
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extractHeadings)
      }
    }

    extractHeadings(content)
    setHeadings(extractedHeadings)

    // Track active heading on scroll
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      
      for (let i = extractedHeadings.length - 1; i >= 0; i--) {
        const heading = document.getElementById(extractedHeadings[i].id)
        if (heading && heading.offsetTop <= scrollPosition) {
          setActiveId(extractedHeadings[i].id)
          return
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [content])

  if (headings.length === 0) return null

  return (
    <nav className={cn("table-of-contents", className)}>
      <h3 className="toc-title">Conteúdo</h3>
      <ul className="toc-list">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              'toc-item',
              `toc-level-${heading.level}`,
              activeId === heading.id && 'active'
            )}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
