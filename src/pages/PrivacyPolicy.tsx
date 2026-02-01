import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Política de Privacidade
        </h1>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground/90">
          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              1. Coleta de Dados
            </h2>
            <p className="leading-relaxed">
              Coletamos informações fornecidas diretamente pelo usuário (nome, e-mail, formação acadêmica) e dados de navegação (cookies e endereço IP) para melhorar a experiência na plataforma e garantir a segurança do acesso.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              2. Finalidade do Tratamento
            </h2>
            <p className="leading-relaxed mb-2">Os dados são utilizados para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personalização de conteúdo sobre ciência de dados e BI.</li>
              <li>Comunicação de atualizações acadêmicas e eventos de pesquisa.</li>
              <li>Análises estatísticas anonimizadas para melhoria da plataforma.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              3. Compartilhamento de Dados
            </h2>
            <p className="leading-relaxed mb-2">
              A comunidade cienciadedados.org não comercializa dados pessoais. O compartilhamento ocorre apenas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com parceiros tecnológicos essenciais para a operação do site.</li>
              <li>Por determinação legal ou judicial.</li>
              <li>Em casos de pesquisas acadêmicas, onde os dados serão tratados de forma agregada e anonimizada, respeitando os preceitos éticos da CAPES/CNPq.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              4. Direitos do Titular (LGPD)
            </h2>
            <p className="leading-relaxed mb-2">
              Em conformidade com a Lei nº 13.709/2018, o usuário tem o direito de:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmar a existência de tratamento de seus dados.</li>
              <li>Acessar, corrigir ou solicitar a exclusão de seus dados pessoais.</li>
              <li>Revogar o consentimento a qualquer momento através do painel de perfil.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              5. Segurança
            </h2>
            <p className="leading-relaxed">
              Implementamos medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda ou alteração.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
              6. Contato
            </h2>
            <p className="leading-relaxed mb-4">
              Para questões relacionadas à privacidade, o usuário pode entrar em contato com o responsável pela comunidade, prof. Dr. Wesley Almeida:
            </p>
            <a 
              href="mailto:wesleyinfo@gmail.com" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              wesleyinfo@gmail.com
            </a>
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

export default PrivacyPolicy;
