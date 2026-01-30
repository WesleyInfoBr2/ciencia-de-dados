import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { FileAttachmentComponent } from './FileAttachmentComponent'

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (options: { 
        url: string
        filename: string
        filesize?: number
        mimetype?: string 
      }) => ReturnType
    }
  }
}

export const FileAttachment = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: element => element.getAttribute('data-url'),
        renderHTML: attributes => {
          if (!attributes.url) return {}
          return { 'data-url': attributes.url }
        },
      },
      filename: {
        default: 'Arquivo',
        parseHTML: element => element.getAttribute('data-filename'),
        renderHTML: attributes => {
          return { 'data-filename': attributes.filename || 'Arquivo' }
        },
      },
      filesize: {
        default: null,
        parseHTML: element => {
          const size = element.getAttribute('data-filesize')
          return size ? parseInt(size, 10) : null
        },
        renderHTML: attributes => {
          if (!attributes.filesize) return {}
          return { 'data-filesize': String(attributes.filesize) }
        },
      },
      mimetype: {
        default: null,
        parseHTML: element => element.getAttribute('data-mimetype'),
        renderHTML: attributes => {
          if (!attributes.mimetype) return {}
          return { 'data-mimetype': attributes.mimetype }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const filename = HTMLAttributes['data-filename'] || 'Arquivo'
    const url = HTMLAttributes['data-url'] || '#'
    const filesize = HTMLAttributes['data-filesize']
    
    // Format file size
    let sizeText = ''
    if (filesize) {
      const size = parseInt(filesize, 10)
      if (size < 1024) {
        sizeText = `${size} B`
      } else if (size < 1024 * 1024) {
        sizeText = `${(size / 1024).toFixed(1)} KB`
      } else {
        sizeText = `${(size / (1024 * 1024)).toFixed(1)} MB`
      }
    }

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'file-attachment',
        class: 'file-attachment-node',
      }),
      [
        'a',
        { 
          href: url, 
          target: '_blank', 
          rel: 'noopener noreferrer',
          class: 'file-attachment-link'
        },
        [
          'span',
          { class: 'file-attachment-icon' },
          '📎'
        ],
        [
          'span',
          { class: 'file-attachment-info' },
          [
            'span',
            { class: 'file-attachment-name' },
            filename
          ],
          ...(sizeText ? [[
            'span',
            { class: 'file-attachment-size' },
            sizeText
          ]] : [])
        ]
      ]
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentComponent)
  },

  addCommands() {
    return {
      setFileAttachment: options => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: options,
          })
          .run()
      },
    }
  },
})
