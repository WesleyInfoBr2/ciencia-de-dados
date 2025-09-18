import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "katex/dist/katex.min.css";
import { Card } from "@/components/ui/card";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const [isClient, setIsClient] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['formula'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'formula'
  ];

  if (!isClient) {
    return (
      <Card className={`p-4 ${className || ""}`}>
        <div className="h-64 animate-pulse bg-muted rounded"></div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="rich-text-editor">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{
            minHeight: "300px"
          }}
        />
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor .ql-editor {
            min-height: 250px;
            font-size: 16px;
            line-height: 1.6;
          }
          
          .rich-text-editor .ql-editor h1 {
            font-size: 2rem;
            font-weight: bold;
            margin: 1rem 0;
          }
          
          .rich-text-editor .ql-editor h2 {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0.8rem 0;
          }
          
          .rich-text-editor .ql-editor h3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin: 0.6rem 0;
          }
          
          .rich-text-editor .ql-editor pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
          }
          
          .rich-text-editor .ql-editor blockquote {
            border-left: 4px solid #007bff;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6c757d;
            font-style: italic;
          }
          
          .rich-text-editor .ql-editor img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
          }
          
          .rich-text-editor .ql-formula {
            cursor: pointer;
          }
          
          .rich-text-editor .ql-snow .ql-tooltip {
            z-index: 1000;
          }
        `
      }} />
    </Card>
  );
};

export default RichTextEditor;