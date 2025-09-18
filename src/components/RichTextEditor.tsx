import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "katex/dist/katex.min.css";
import katex from "katex";
import { supabase } from "@/integrations/supabase/client";
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
    // Torna o KaTeX disponível globalmente para o módulo de fórmulas do Quill
    (window as any).katex = katex;
    setIsClient(true);
  }, []);

  // Função para processar e limpar o conteúdo antes de salvar
  const handleContentChange = (content: string) => {
    // Remove imagens em base64 que podem corromper o conteúdo
    const cleanContent = content.replace(/<img[^>]*src="data:image\/[^"]*"[^>]*>/gi, '[Imagem removida - use URLs de imagem ao invés de upload direto]');
    
    // Limita o tamanho do conteúdo para evitar problemas no banco
    if (cleanContent.length > 500000) { // 500KB limit
      console.warn('Conteúdo muito longo, será truncado');
      onChange(cleanContent.substring(0, 500000) + '...');
    } else {
      onChange(cleanContent);
    }
  };

  // Handler para upload de imagem no Supabase e inserção por URL pública
  const handleImageUpload = async () => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    // Permite escolher arquivo de imagem
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const path = `wiki/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('wiki-images').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
        if (error) throw error;
        const { data: pub } = supabase.storage.from('wiki-images').getPublicUrl(path);
        const range = quill.getSelection(true);
        const index = range ? range.index : quill.getLength();
        quill.insertEmbed(index, 'image', pub.publicUrl, 'user');
        quill.setSelection(index + 1, 0);
      } catch (err) {
        console.error('Erro ao enviar imagem:', err);
        alert('Falha ao enviar imagem. Tente novamente.');
      }
    };

    input.click();
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['formula'],
        ['clean']
      ],
      handlers: {
        image: handleImageUpload,
      }
    },
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
    'link', 'image',
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
          onChange={handleContentChange}
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