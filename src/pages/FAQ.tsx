import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, BookOpen, Library, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { updatePageMetadata, generateStructuredData } from "@/utils/seo";

const FAQ = () => {
  // SEO Metadata with FAQPage structured data
  useEffect(() => {
    updatePageMetadata({
      title: "Perguntas Frequentes | CiênciaDeDados.org",
      description: "Tire suas dúvidas sobre a comunidade, publicação na Wiki, bibliotecas de recursos e planos de assinatura dos produtos.",
      canonical: "https://cienciadedados.org/faq",
      ogTitle: "FAQ - CiênciaDeDados.org",
      ogDescription: "Encontre respostas para as dúvidas mais comuns sobre a plataforma brasileira de ciência de dados.",
      ogImage: "https://cienciadedados.org/og-image.jpg",
    });

    // Generate FAQPage structured data for rich snippets
    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Quem pode publicar conteúdo na Wiki?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Qualquer membro cadastrado na comunidade pode criar e publicar artigos na Wiki."
          }
        },
        {
          "@type": "Question",
          "name": "Os recursos das bibliotecas são gratuitos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A consulta ao catálogo é gratuita. Cada item indica seu modelo de preço."
          }
        },
        {
          "@type": "Question",
          "name": "Quais são os planos disponíveis?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oferecemos três níveis: Gratuito, Limitado e Ilimitado (R$ 149/mês)."
          }
        }
      ]
    };

    const existingScript = document.querySelector('script[type="application/ld+json"]#faq-structured-data');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-structured-data';
    script.textContent = JSON.stringify(faqStructuredData);
    document.head.appendChild(script);

    return () => {
      const cleanupScript = document.querySelector('script#faq-structured-data');
      if (cleanupScript) cleanupScript.remove();
    };
  }, []);

  const faqSections = [
    {
      title: "Publicação na Wiki",
      description: "Dúvidas sobre como criar e compartilhar conteúdo na Wiki da comunidade",
      icon: BookOpen,
      questions: [
        {
          question: "Quem pode publicar conteúdo na Wiki?",
          answer: "Qualquer membro cadastrado na comunidade pode criar e publicar artigos na Wiki. Basta fazer login e acessar a opção 'Novo Artigo' na página da Wiki."
        },
        {
          question: "Quais tipos de conteúdo posso publicar?",
          answer: "A Wiki aceita três tipos de publicação: Conteúdo (artigos e insights sobre ciência de dados), Como Fazer (tutoriais práticos e guias passo a passo) e Aplicação Prática (cases reais e projetos implementados)."
        },
        {
          question: "Como funciona o processo de publicação?",
          answer: "Ao criar um artigo, ele fica salvo como rascunho até você decidir publicar. Você pode editar, adicionar imagens, códigos e arquivos anexos. Quando estiver satisfeito, basta clicar em 'Publicar' para torná-lo visível a toda comunidade."
        },
        {
          question: "Posso editar ou excluir meus artigos após publicar?",
          answer: "Sim, você pode editar seus artigos a qualquer momento. A exclusão também é permitida, mas recomendamos cautela, pois o conteúdo pode já ter sido referenciado por outros membros."
        },
        {
          question: "Como funciona a propriedade intelectual dos artigos?",
          answer: "Ao publicar, você concede à comunidade uma licença não exclusiva para exibição do conteúdo. Você mantém a autoria e pode republicar em outros locais, desde que não viole direitos de terceiros."
        },
        {
          question: "Posso incluir códigos e fórmulas nos artigos?",
          answer: "Sim! O editor suporta blocos de código com syntax highlighting para diversas linguagens (Python, R, SQL, etc.), além de fórmulas matemáticas em LaTeX."
        },
        {
          question: "Como adiciono imagens e arquivos aos artigos?",
          answer: "Você pode colar imagens diretamente no editor (Ctrl+V) ou arrastá-las. Para arquivos, utilize o botão de anexo na barra de ferramentas. Os arquivos ficam armazenados de forma segura na plataforma."
        }
      ]
    },
    {
      title: "Bibliotecas de Recursos",
      description: "Informações sobre o catálogo de ferramentas, cursos, códigos e datasets",
      icon: Library,
      questions: [
        {
          question: "O que são as Bibliotecas de Recursos?",
          answer: "São catálogos curados de recursos úteis para ciência de dados, organizados em categorias: Ferramentas Digitais, Formações, Livros e Materiais, Códigos e Pacotes, e Bancos de Dados."
        },
        {
          question: "Os recursos das bibliotecas são gratuitos?",
          answer: "A consulta ao catálogo é gratuita. Cada item indica seu modelo de preço (Grátis, Pago, Freemium ou Assinatura). Alguns recursos externos podem ter custos próprios."
        },
        {
          question: "Como posso sugerir um novo recurso para as bibliotecas?",
          answer: "Você pode sugerir novos recursos através da página de Contato, selecionando o motivo 'Feedback'. Nossa equipe avaliará a sugestão e, se aprovada, incluirá no catálogo."
        },
        {
          question: "Posso fazer download de datasets?",
          answer: "Sim, para itens da categoria Bancos de Dados que disponibilizam arquivos para download, há um botão específico na página de detalhes do recurso."
        },
        {
          question: "Como funciona o sistema de destaque?",
          answer: "Recursos em destaque são selecionados pela curadoria da comunidade com base em qualidade, relevância e popularidade. Eles aparecem no carrossel da página principal das Bibliotecas."
        },
        {
          question: "Posso filtrar recursos por características específicas?",
          answer: "Sim! Além dos filtros gerais (categoria, preço, tags), cada categoria possui filtros específicos. Por exemplo, Códigos podem ser filtrados por linguagem, e Ferramentas por plataforma."
        }
      ]
    },
    {
      title: "Produtos e Assinaturas",
      description: "Esclarecimentos sobre planos, preços e acesso aos produtos da comunidade",
      icon: CreditCard,
      questions: [
        {
          question: "Quais são os planos disponíveis?",
          answer: "Oferecemos três níveis: Gratuito (acesso básico à Central, criação de posts e comentários), Limitado (acesso completo a um produto específico) e Ilimitado (R$ 149,00 - acesso total a todos os produtos)."
        },
        {
          question: "O que está incluído no plano Gratuito?",
          answer: "Com o plano Gratuito você tem acesso à Wiki, pode publicar artigos, comentar, consultar as Bibliotecas e participar da comunidade. O acesso aos produtos (EstatísticaFácil, RevPrisma, DadosBrasil) é limitado."
        },
        {
          question: "Como funciona o plano Limitado?",
          answer: "O plano Limitado permite acesso completo a um produto específico de sua escolha, mantendo acesso básico aos demais. Ideal para quem precisa de uma ferramenta específica."
        },
        {
          question: "O que oferece o plano Ilimitado?",
          answer: "Por R$ 149,00 mensais, você tem acesso completo e ilimitado a todos os produtos da rede, incluindo novos lançamentos, sem restrições de uso."
        },
        {
          question: "Como faço para contratar um plano?",
          answer: "Acesse a página de Preços, escolha o plano desejado e siga o processo de pagamento. Aceitamos cartão de crédito e PIX. A ativação é imediata após confirmação."
        },
        {
          question: "Posso cancelar minha assinatura a qualquer momento?",
          answer: "Sim, você pode cancelar sua assinatura quando desejar através do painel de perfil. O acesso permanece ativo até o final do período já pago."
        },
        {
          question: "Os produtos estão disponíveis para uso?",
          answer: "Atualmente, nossos produtos (EstatísticaFácil, RevPrisma, DadosBrasil) estão em fase de desenvolvimento. O lançamento está previsto para breve. Fique atento às novidades!"
        },
        {
          question: "Existe período de teste gratuito?",
          answer: "Cada produto pode oferecer um período de avaliação. Consulte a página específica de cada produto para conhecer as condições de teste disponíveis."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HelpCircle className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Central de Ajuda</span>
            </div>
            
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre a comunidade, 
              publicação de conteúdo, recursos e nossos produtos.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="shadow-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((item, questionIndex) => (
                      <AccordionItem key={questionIndex} value={`${sectionIndex}-${questionIndex}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-muted/30 rounded-2xl p-8">
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
              Não encontrou o que procurava?
            </h3>
            <p className="text-muted-foreground mb-6">
              Entre em contato conosco e teremos prazer em ajudar.
            </p>
            <Link 
              to="/contato" 
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
