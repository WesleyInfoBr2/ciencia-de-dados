import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Termos de Uso
        </h1>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground/90">
          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="leading-relaxed">
              Ao acessar e utilizar a plataforma www.cienciadedados.org, o usuário concorda em cumprir e estar vinculado aos presentes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              2. Objeto e Finalidade
            </h2>
            <p className="leading-relaxed">
              A comunidade tem como objetivo o compartilhamento de conhecimento, discussão de técnicas de estatística, pesquisa operacional, business intelligence, Python, big data e gestão educacional. O uso da plataforma deve ser estritamente para fins educacionais, profissionais e de pesquisa.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              3. Cadastro e Responsabilidade
            </h2>
            <p className="leading-relaxed">
              O usuário é responsável pela veracidade das informações fornecidas no cadastro e pela segurança de sua senha. É proibida a cessão da conta a terceiros.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              4. Propriedade Intelectual e Conteúdo
            </h2>
            <p className="leading-relaxed mb-4">
              Todo conteúdo publicado pelos moderadores é de propriedade da comunidade ou de seus respectivos autores. Ao publicar conteúdos (artigos, scripts Python, datasets), o usuário concede à comunidade uma licença não exclusiva para exibição.
            </p>
            <p className="leading-relaxed mb-2">É terminantemente proibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Publicar material protegido por direitos autorais sem autorização.</li>
              <li>Utilizar a plataforma para disseminação de spam ou softwares maliciosos.</li>
              <li>Praticar qualquer forma de assédio ou discriminação.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              5. Limitação de Responsabilidade
            </h2>
            <p className="leading-relaxed">
              A comunidade não se responsabiliza por decisões tomadas com base nas informações compartilhadas, visto que o caráter é estritamente informativo e educacional.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
