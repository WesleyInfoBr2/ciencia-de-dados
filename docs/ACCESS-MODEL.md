# Modelo de Acesso Multi-Produto

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Compartilhado)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │   Auth      │  │  profiles   │  │  products / product_access  │ │
│  │  (único)    │  │  (único)    │  │      (assinaturas)          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
        │                   │                      │
        ▼                   ▼                      ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│    Central    │  │ EstatísticaF. │  │  RevPrisma    │  │  DadosBrasil  │
│    (www)      │  │ (subdomínio)  │  │ (subdomínio)  │  │ (subdomínio)  │
└───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
```

## Produtos Atuais

| Slug           | Nome            | Subdomínio                     | Status       |
|----------------|-----------------|--------------------------------|--------------|
| estatisticafacil | EstatísticaFácil | estatisticafacil.cienciadedados.org | development |
| revprisma      | RevPrisma       | revprisma.cienciadedados.org   | development  |
| dadosbrasil    | DadosBrasil     | dadosbrasil.cienciadedados.org | development  |
| pnfacil        | PnFácil         | pnfacil.cienciadedados.org     | development  |
| gestorllm      | GestorLLM       | gestorllm.cienciadedados.org   | development  |

## Modelo de Acesso

### ❌ O que NÃO fazemos
- Roles globais fixas (admin, user, etc.) para controle de acesso a produtos
- Duplicação de usuários entre subdomínios
- Hardcoded access levels

### ✅ O que fazemos
- Acesso baseado em **assinatura por produto**
- Usuário único no Supabase Auth compartilhado
- Verificação de acesso via função `check_product_access()`

## Tipos de Acesso

### 1. Gratuito
```
Condição: Usuário autenticado SEM assinatura ativa
Acesso:
  - ✅ Total às áreas abertas da Central
  - ✅ Básico (free tier) a todos os produtos
  - ⚠️ Limite de uso: 100 ações/mês por produto
```

### 2. Limitado (por produto)
```
Condição: Usuário COM assinatura ativa em UM OU MAIS produtos
Acesso:
  - ✅ Tudo do Gratuito
  - ✅ Completo aos produtos assinados
  - ⚠️ Básico nos produtos NÃO assinados
```

### 3. Ilimitado
```
Condição: Usuário COM assinatura ativa em TODOS os produtos públicos
Acesso:
  - ✅ Completo a todos os produtos
  - ℹ️ É uma condição CALCULADA, não uma role fixa
```

## Tabelas Envolvidas

### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,        -- 'estatisticafacil'
  name TEXT NOT NULL,               -- 'EstatísticaFácil'
  custom_domain TEXT,               -- 'estatisticafacil.cienciadedados.org'
  is_public BOOLEAN DEFAULT false,  -- Visível para assinaturas
  is_available BOOLEAN DEFAULT false, -- Disponível para acesso
  status TEXT DEFAULT 'development' -- development, beta, production
);
```

### `product_access`
```sql
CREATE TABLE product_access (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id),
  access_type TEXT NOT NULL,        -- 'free', 'limited', 'unlimited'
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER
);
```

### `subscriptions` (opcional - para planos gerais)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  plan subscription_plan DEFAULT 'gratuito', -- gratuito, limitado, ilimitado
  status subscription_status DEFAULT 'active',
  expires_at TIMESTAMPTZ
);
```

## Função de Verificação

```sql
-- check_product_access(_user_id UUID, _product_slug TEXT)
-- Retorna: has_access, access_level, usage_limit, usage_count

-- Lógica:
-- 1. Busca produto pelo slug
-- 2. Verifica assinatura do usuário
-- 3. Conta produtos assinados vs total de produtos
-- 4. Retorna nível de acesso:
--    - 'ilimitado' se tem todos os produtos
--    - 'limitado' se tem este produto específico
--    - 'gratuito' como fallback
```

## Fluxo de Verificação no Subdomínio

```typescript
// Em cada produto (subdomínio)
import { supabase } from "@/integrations/supabase/client";

async function checkAccess(productSlug: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redireciona para login na Central
    window.location.href = 'https://www.cienciadedados.org/auth';
    return;
  }
  
  const { data } = await supabase.rpc('check_product_access', {
    _user_id: user.id,
    _product_slug: productSlug
  });
  
  const access = data?.[0];
  
  if (access?.access_level === 'gratuito') {
    // Mostra features limitadas
    showFreeTier();
  } else if (access?.access_level === 'limitado') {
    // Mostra todas as features
    showFullAccess();
  } else if (access?.access_level === 'ilimitado') {
    // Mostra features premium + benefícios extras
    showUnlimitedAccess();
  }
}
```

## SSO (Single Sign-On)

O login é centralizado na Central. Para acessar um produto:

1. Usuário clica "Acessar Produto" na Central
2. Central verifica se usuário está autenticado
3. Central gera URL com tokens de sessão
4. Usuário é redirecionado para o subdomínio
5. Subdomínio recebe tokens e autentica localmente

```typescript
// Central: Gerar URL de SSO
const url = new URL(`https://${productBaseUrl}`);
url.searchParams.set("access_token", session.access_token);
url.searchParams.set("refresh_token", session.refresh_token);
window.location.href = url.toString();

// Subdomínio: Receber SSO
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');
await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
```

## Configuração DNS

Todos os subdomínios apontam para o IP do Lovable:

```dns
Tipo: A    | Nome: www              | Valor: 185.158.133.1
Tipo: A    | Nome: estatisticafacil | Valor: 185.158.133.1
Tipo: A    | Nome: revprisma        | Valor: 185.158.133.1
Tipo: A    | Nome: dadosbrasil      | Valor: 185.158.133.1
Tipo: A    | Nome: pnfacil          | Valor: 185.158.133.1
Tipo: A    | Nome: gestorllm        | Valor: 185.158.133.1
```

## Variáveis de Ambiente

Todos os projetos usam o mesmo Supabase:

```env
VITE_SUPABASE_URL=https://cdniklunhzcbwcxlsxfl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

---

**Última atualização**: 2026-02-01  
**Mantenedor**: Equipe Ciência de Dados
