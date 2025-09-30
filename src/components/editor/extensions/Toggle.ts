import { Node, mergeAttributes } from '@tiptap/core'

export interface ToggleOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      setToggle: (options?: { open?: boolean }) => ReturnType
    }
  }
}

export const Toggle = Node.create<ToggleOptions>({
  name: 'toggle',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: element => element.getAttribute('data-open') === 'true',
        renderHTML: attributes => {
          return { 'data-open': attributes.open ? 'true' : 'false' }
        }
      },
      summary: {
        default: 'Toggle',
        parseHTML: element => element.getAttribute('data-summary'),
        renderHTML: attributes => {
          return { 'data-summary': attributes.summary }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'details[data-type="toggle"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'toggle',
        class: 'toggle-block',
        ...(HTMLAttributes.open && { open: true })
      }),
      ['summary', { class: 'toggle-summary' }, HTMLAttributes.summary || 'Toggle'],
      ['div', { class: 'toggle-content' }, 0]
    ]
  },

  addCommands() {
    return {
      setToggle: options => ({ commands }) => {
        return commands.wrapIn(this.name, options)
      }
    }
  }
})
