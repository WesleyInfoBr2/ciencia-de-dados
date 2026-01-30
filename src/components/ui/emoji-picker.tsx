import { useState } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { ScrollArea } from './scroll-area'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  disabled?: boolean
}

// Lista de emojis comuns organizados por categoria
const emojiCategories = {
  'Documentação': ['📖', '📚', '📄', '📝', '📋', '📑', '📓', '📒', '📕', '📗', '📘', '📙'],
  'Tecnologia': ['💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '📀', '🔌', '📱', '📲', '☎️', '📞'],
  'Ciência': ['🧠', '🔬', '🧪', '🧬', '🔭', '🧮', '📊', '📈', '📉', '🗃️', '🗄️', '📁'],
  'Comunicação': ['💡', '🎯', '🚀', '⚡', '✨', '🔥', '💫', '🌟', '⭐', '🏆', '🎖️', '🏅'],
  'Símbolos': ['✅', '❌', '⚠️', 'ℹ️', '❓', '❗', '🔒', '🔓', '🔑', '🔗', '⚙️', '🔧'],
  'Objetos': ['📅', '🕐', '⏰', '⏳', '📧', '✉️', '📨', '📦', '🎁', '🎉', '🎊', '🎈'],
  'Natureza': ['🌐', '🌍', '🌎', '🌏', '🗺️', '☀️', '🌙', '☁️', '🌈', '🌊', '🔵', '🟢'],
  'Pessoas': ['👥', '👤', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🤖'],
}

export function EmojiPicker({ value, onChange, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (emoji: string) => {
    onChange(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal text-2xl h-12"
          disabled={disabled}
        >
          {value || '📝'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <ScrollArea className="h-72">
          <div className="p-3 space-y-4">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">{category}</h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelect(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
