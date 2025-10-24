# Configuração Multi-Projeto com SSO
## Guia Completo para Arquitetura de Subdomínios

## 📋 Visão Geral da Arquitetura

Este projeto utiliza uma arquitetura multi-projeto onde:
- **Central**: `www.cienciadedados.org` - Hub principal e autenticação
- **Produtos separados**: Cada um em seu próprio projeto Lovable com subdomínio dedicado

### Estrutura de Domínios
```
www.cienciadedados.org          → Projeto Central (este)
dadosbrasil.cienciadedados.org  → Projeto DadosBrasil (separado)
gestorllm.cienciadedados.org    → Projeto GestorLLM (separado)
revprisma.cienciadedados.org    → Projeto RevPrisma (separado)
estatisticafacil.cienciadedados.org → Projeto EstatísticaFácil (separado)
```

---

## 🌐 Configuração DNS

### Onde Verificar Seu Registrador de Domínio

**Nota**: O Lovable não tem acesso às suas configurações de DNS. Você precisa verificar onde seu domínio está registrado:

#### Se você trouxe do Wix:
1. **Opção 1 - Domínio ainda no Wix**:
   - Acesse: [Wix Dashboard](https://manage.wix.com/dashboard/)
   - Vá em: **Domínios** → Selecione `cienciadedados.org`
   - Procure por "DNS Settings" ou "Advanced DNS"

2. **Opção 2 - Domínio transferido para outro registrador**:
   - Verifique seu email para confirmação de transferência
   - Registradores comuns: GoDaddy, Namecheap, Hostinger, Registro.br

3. **Opção 3 - Descobrir o registrador**:
   - Use [WHOIS Lookup](https://www.whois.com/whois/cienciadedados.org)
   - Procure por "Registrar" nas informações

### Configuração DNS Necessária

No seu registrador, adicione os seguintes registros A:

```dns
Tipo: A    | Nome: www              | Valor: 185.158.133.1
Tipo: A    | Nome: dadosbrasil      | Valor: 185.158.133.1
Tipo: A    | Nome: gestorllm        | Valor: 185.158.133.1
Tipo: A    | Nome: revprisma        | Valor: 185.158.133.1
Tipo: A    | Nome: estatisticafacil | Valor: 185.158.133.1
```

**Importante**: A propagação DNS pode levar até 48h, mas geralmente ocorre em 1-4 horas.

---

## 🏗️ Passo a Passo: Criação dos Projetos

### 1. Criar Novo Projeto no Lovable (Para Cada Produto)

1. Acesse [Lovable](https://lovable.dev)
2. Clique em **"New Project"**
3. Nomeie conforme o produto (ex: "DadosBrasil")
4. Clone o código base ou comece do zero

### 2. Configurar Supabase para Cada Projeto

**Opção A - Supabase Compartilhado (Recomendado para SSO)**:
- Use o mesmo projeto Supabase para todos os produtos
- ID do Projeto: `cdniklunhzcbwcxlsxfl`
- URL: `https://cdniklunhzcbwcxlsxfl.supabase.co`
- Vantagem: Autenticação unificada automática

**Opção B - Supabase Separado**:
- Crie um projeto Supabase para cada produto
- Implemente SSO via tokens compartilhados (mais complexo)

### 3. Conectar Domínio no Lovable

Para **cada projeto separado**:

1. Abra o projeto no Lovable
2. Vá em **Settings** → **Domains**
3. Clique em **"Connect Domain"**
4. Digite o subdomínio completo (ex: `dadosbrasil.cienciadedados.org`)
5. Aguarde verificação DNS (pode levar até 48h)
6. SSL será provisionado automaticamente pelo Lovable

### 4. Configurar GitHub (Opcional mas Recomendado)

Para cada projeto:
1. No Lovable, vá em **GitHub** → **Connect to GitHub**
2. Autorize o Lovable GitHub App
3. Crie um repositório separado (ex: `dadosbrasil-app`)

---

## 🔐 Sistema de SSO (Single Sign-On)

### Como Funciona o SSO

O projeto Central gerencia toda a autenticação. Quando um usuário acessa um produto:

1. **Usuário clica** no produto na Central
2. **Central verifica** se usuário tem acesso ao produto
3. **Central gera** token de sessão do Supabase
4. **Central redireciona** para subdomínio com token na URL
5. **Produto recebe** token e autentica automaticamente

### Implementação no Projeto Central

O sistema de SSO já está implementado em:
- `src/lib/sso.ts` - Utilitários para geração de links com tokens
- `src/hooks/useProductAccess.tsx` - Hook para verificar acesso do usuário

### Implementação nos Produtos (Subdomínios)

Em cada projeto de produto, adicione este código:

```typescript
// src/utils/ssoAuth.ts
import { supabase } from "@/integrations/supabase/client";

export const handleSSOLogin = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error) {
      // Remove tokens da URL
      window.history.replaceState({}, '', window.location.pathname);
      return true;
    }
  }
  return false;
};
```

E no componente principal do produto:

```typescript
// src/App.tsx (ou index)
useEffect(() => {
  handleSSOLogin();
}, []);
```

---

## 🚀 Fluxo de Acesso a Produtos

### 1. Verificação de Acesso

A tabela `product_access` controla quem pode acessar cada produto:

```sql
-- Exemplo: Dar acesso ao produto DadosBrasil para um usuário
INSERT INTO product_access (user_id, product_id, access_type, is_active)
VALUES (
  'uuid-do-usuario',
  'uuid-do-produto-dadosbrasil',
  'unlimited',
  true
);
```

### 2. Níveis de Acesso

- **free**: Acesso limitado/demonstração
- **limited**: Acesso com restrições (ex: 100 consultas/mês)
- **unlimited**: Acesso completo

### 3. Admin: Gerenciamento de Acesso

No painel Admin (`/admin`):
1. Aba **"Produtos"**: Gerenciar produtos, status, disponibilidade
2. Aba **"Usuários"**: Atribuir acesso a produtos específicos (em desenvolvimento)

---

## 🔧 Manutenção e Desenvolvimento

### Desenvolvendo em Projetos Separados

1. **No Lovable**: Edite diretamente cada projeto via interface
2. **Via GitHub**: 
   - Clone o repositório do produto
   - Faça alterações localmente
   - Push para GitHub → Sincroniza automaticamente com Lovable

### Testando Localmente

```bash
# Clone o repositório do produto
git clone https://github.com/seu-org/dadosbrasil-app.git
cd dadosbrasil-app

# Instale dependências
npm install

# Configure .env com as mesmas variáveis do Supabase
# (Copie de .env do projeto central)

# Execute localmente
npm run dev
```

### Variáveis de Ambiente Compartilhadas

Se usar Supabase compartilhado, use as mesmas variáveis em todos os projetos:

```env
VITE_SUPABASE_URL=https://cdniklunhzcbwcxlsxfl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

---

## 📊 Checklist de Implementação

### Projeto Central (Este)
- [x] Sistema de autenticação implementado
- [x] Tabela `products` configurada
- [x] Tabela `product_access` configurada
- [x] Painel Admin criado
- [x] Sistema SSO implementado
- [x] Redirecionamento inteligente implementado
- [ ] Domínio `www.cienciadedados.org` conectado

### Para Cada Produto (DadosBrasil, GestorLLM, RevPrisma, EstatísticaFácil)
- [ ] Criar novo projeto no Lovable
- [ ] Conectar ao Supabase (compartilhado ou separado)
- [ ] Implementar receptor SSO (`handleSSOLogin`)
- [ ] Configurar DNS (registros A)
- [ ] Conectar subdomínio no Lovable
- [ ] Conectar ao GitHub
- [ ] Testar autenticação via Central
- [ ] Inserir dados do produto na tabela `products`

---

## 🆘 Troubleshooting

### Domínio não verifica no Lovable
- **Verificar**: DNS configurado corretamente no registrador
- **Testar**: Use [DNS Checker](https://dnschecker.org) para verificar propagação
- **Aguardar**: Pode levar até 48h para propagação completa

### SSL não provisiona
- **Verificar**: Registros A apontam para `185.158.133.1`
- **Remover**: Registros DNS conflitantes (AAAA, CNAME para mesmo subdomínio)
- **Aguardar**: Pode levar algumas horas após DNS propagar

### SSO não funciona entre domínios
- **Verificar**: Todos os projetos usam o mesmo Supabase
- **Verificar**: Tokens sendo passados corretamente na URL
- **Verificar**: `handleSSOLogin` implementado no produto de destino

### Usuário não tem acesso ao produto
- **Verificar**: Registro em `product_access` existe e `is_active = true`
- **Verificar**: Produto está com `is_available = true` na tabela `products`
- **Verificar**: Admin pode ver e gerenciar acessos em `/admin`

---

## 📚 Recursos Adicionais

- [Documentação Lovable - Custom Domains](https://docs.lovable.dev/features/custom-domains)
- [Supabase Auth - SSO](https://supabase.com/docs/guides/auth)
- [DNS Checker Tool](https://dnschecker.org)
- [WHOIS Lookup](https://www.whois.com)

---

**Última atualização**: 2025-01-20
**Mantenedor**: Equipe Ciência de Dados
