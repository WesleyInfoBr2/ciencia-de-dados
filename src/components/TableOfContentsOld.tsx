import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Link, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: any; // Tiptap content
  className?: string;
}

export const TableOfContents = ({ content, className }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (!content) return;

    const extractHeadings = (node: any, headings: Heading[] = []): Heading[] => {
      if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
        const text = node.content?.[0]?.text || '';
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        
        headings.push({
          id,
          text,
          level: node.attrs.level
        });
      }

      if (node.content) {
        node.content.forEach((child: any) => extractHeadings(child, headings));
      }

      return headings;
    };

    const extractedHeadings = extractHeadings(content);
    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    // Add IDs to headings in the DOM
    headings.forEach(heading => {
      // Find heading elements by level and text content
      const elements = Array.from(document.querySelectorAll(`h${heading.level}`));
      const element = elements.find(el => el.textContent?.trim() === heading.text);
      if (element) {
        element.id = heading.id;
      }
    });

    // Setup intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px'
      }
    );

    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        description: "Link copiado para a área de transferência",
        duration: 2000,
      });
    });
  };

  if (headings.length === 0) return null;

  return (
    <Card className={`sticky top-24 ${className || ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <List className="h-4 w-4" />
          Sumário
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav aria-label="Sumário do artigo">
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => (
              <li key={heading.id}>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`justify-start h-auto p-1 text-left hover:text-primary ${
                      heading.level === 3 ? 'ml-4' : ''
                    } ${
                      activeHeading === heading.id ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                    onClick={() => scrollToHeading(heading.id)}
                  >
                    {heading.text}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={() => copyLink(heading.id)}
                    aria-label={`Copiar link para ${heading.text}`}
                  >
                    <Link className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};