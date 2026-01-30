import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { Check, Copy, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LANGUAGES = [
  { value: '', label: 'Texto' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'r', label: 'R' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
]

export function CodeBlockComponent({ node, updateAttributes, extension }: NodeViewProps) {
  const [copied, setCopied] = useState(false)
  const language = node.attrs.language || ''

  const copyToClipboard = () => {
    const text = node.textContent || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const currentLanguage = LANGUAGES.find(l => l.value === language) || LANGUAGES[0]

  return (
    <NodeViewWrapper className="code-block-wrapper relative group my-4">
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs gap-1 bg-background/80 backdrop-blur-sm"
            >
              {currentLanguage.label}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.value}
                onClick={() => updateAttributes({ language: lang.value })}
                className={language === lang.value ? 'bg-accent' : ''}
              >
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="secondary"
          size="sm"
          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
          onClick={copyToClipboard}
          title="Copiar código"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      {language && (
        <div className="absolute top-2 left-3 text-xs text-muted-foreground font-mono">
          {currentLanguage.label}
        </div>
      )}

      <pre className="!mt-0 !rounded-lg bg-muted/50 border">
        <NodeViewContent as="div" className={`code-content ${language ? `language-${language}` : ''}`} />
      </pre>
    </NodeViewWrapper>
  )
}
