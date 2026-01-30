import { useState, useRef, useEffect } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPicker({ value, onChange, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (emoji: any) => {
    onChange(emoji.native)
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
      <PopoverContent className="w-auto p-0" align="start">
        <Picker
          data={data}
          onEmojiSelect={handleSelect}
          locale="pt"
          theme="auto"
          previewPosition="none"
          skinTonePosition="none"
        />
      </PopoverContent>
    </Popover>
  )
}
