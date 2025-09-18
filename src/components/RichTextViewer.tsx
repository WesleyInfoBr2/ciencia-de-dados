import { useEffect, useState } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface RichTextViewerProps {
  content: string;
  className?: string;
}

const RichTextViewer = ({ content, className }: RichTextViewerProps) => {
  const [processedContent, setProcessedContent] = useState("");

  useEffect(() => {
    // Process LaTeX formulas in the content
    let processed = content;

    // Replace Quill formula spans with KaTeX rendering
    processed = processed.replace(
      /<span class="ql-formula" data-value="([^"]*)"[^>]*>.*?<\/span>/g,
      (match, formula) => {
        try {
          // Decode HTML entities
          const decodedFormula = formula
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          
          return `<span class="math-formula" data-formula="${decodedFormula}"></span>`;
        } catch (error) {
          console.error("Error processing formula:", error);
          return match;
        }
      }
    );

    // Process block formulas ($$...$$)
    processed = processed.replace(
      /\$\$([^$]+)\$\$/g,
      '<div class="math-block" data-formula="$1"></div>'
    );

    // Process inline formulas ($...$)
    processed = processed.replace(
      /\$([^$]+)\$/g,
      '<span class="math-inline" data-formula="$1"></span>'
    );

    setProcessedContent(processed);
  }, [content]);

  useEffect(() => {
    // Render KaTeX formulas after content is processed
    const renderMath = () => {
      // Render block math
      document.querySelectorAll('.math-block').forEach((element) => {
        const formula = element.getAttribute('data-formula');
        if (formula) {
          try {
            const mathElement = document.createElement('div');
            mathElement.style.margin = '1rem 0';
            mathElement.style.textAlign = 'center';
            element.parentNode?.insertBefore(mathElement, element);
            element.remove();
            
            // Use BlockMath component indirectly
            import('react-katex').then(({ BlockMath }) => {
              import('react-dom/client').then(({ createRoot }) => {
                const root = createRoot(mathElement);
                root.render(BlockMath({ math: formula }));
              });
            });
          } catch (error) {
            console.error('Error rendering block math:', error);
            element.textContent = `Error rendering formula: ${formula}`;
          }
        }
      });

      // Render inline math
      document.querySelectorAll('.math-inline, .math-formula').forEach((element) => {
        const formula = element.getAttribute('data-formula');
        if (formula) {
          try {
            const mathElement = document.createElement('span');
            element.parentNode?.insertBefore(mathElement, element);
            element.remove();
            
            // Use InlineMath component indirectly
            import('react-katex').then(({ InlineMath }) => {
              import('react-dom/client').then(({ createRoot }) => {
                const root = createRoot(mathElement);
                root.render(InlineMath({ math: formula }));
              });
            });
          } catch (error) {
            console.error('Error rendering inline math:', error);
            element.textContent = `Error: ${formula}`;
          }
        }
      });
    };

    if (processedContent) {
      // Small delay to ensure DOM is updated
      setTimeout(renderMath, 100);
    }
  }, [processedContent]);

  return (
    <div 
      className={`prose prose-lg max-w-none dark:prose-invert
        prose-headings:text-foreground 
        prose-p:text-foreground/90
        prose-strong:text-foreground
        prose-code:text-foreground
        prose-code:bg-muted
        prose-code:px-1
        prose-code:py-0.5
        prose-code:rounded
        prose-pre:bg-muted
        prose-pre:border
        prose-blockquote:border-primary
        prose-blockquote:text-foreground/80
        prose-blockquote:bg-muted/20
        prose-blockquote:px-4
        prose-blockquote:py-2
        prose-blockquote:rounded
        prose-a:text-primary
        prose-a:no-underline
        hover:prose-a:underline
        prose-img:rounded-lg
        prose-img:shadow-md
        prose-table:border-collapse
        prose-th:border
        prose-th:border-border
        prose-th:bg-muted
        prose-td:border
        prose-td:border-border
        prose-ul:list-disc
        prose-ol:list-decimal
        ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default RichTextViewer;