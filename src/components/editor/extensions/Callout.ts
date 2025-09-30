import { Node, mergeAttributes } from '@tiptap/core'

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (options: { variant?: string, emoji?: string }) => ReturnType
      toggleCallout: () => ReturnType
    }
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-variant'),
        renderHTML: attributes => {
          return { 'data-variant': attributes.variant }
        }
      },
      emoji: {
        default: '💡',
        parseHTML: element => element.getAttribute('data-emoji'),
        renderHTML: attributes => {
          return { 'data-emoji': attributes.emoji }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        class: 'callout'
      }),
      ['div', { class: 'callout-emoji' }, HTMLAttributes.emoji],
      ['div', { class: 'callout-content' }, 0]
    ]
  },

  addCommands() {
    return {
      setCallout: options => ({ commands }) => {
        return commands.wrapIn(this.name, options)
      },
      toggleCallout: () => ({ commands }) => {
        return commands.toggleWrap(this.name)
      }
    }
  }
})
