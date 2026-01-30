import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { createLowlight, common } from 'lowlight'
import { CodeBlockComponent } from './CodeBlockComponent'

// Register common languages
const lowlight = createLowlight(common)

export const CodeBlockWithCopy = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },
}).configure({
  lowlight,
  defaultLanguage: null,
})
