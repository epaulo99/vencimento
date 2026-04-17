# Validade de Bebidas (PWA)

Web app mobile-first para controle de validade de bebidas em bares de hotel.

## Rodar localmente

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm run preview
```

## Integracao Supabase

A aplicacao continua funcionando com LocalStorage normalmente.
Quando o Supabase estiver configurado, ela sincroniza automaticamente o estado global.

### 1) Configure as variaveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

### 2) Crie tabela + policies (SQL Editor)

Use o conteudo de:

- `supabase/schema_and_policies.sql`

Esse script cria:

- tabela `public.app_state`
- RLS habilitado
- policies anon/auth compativeis com o app atual (sem Supabase Auth)

### 3) Hardening futuro (quando migrar para Supabase Auth)

Quando o login for migrado para Supabase Auth, execute:

- `supabase/hardening_auth_template.sql`

Esse script remove policies anonimas e deixa acesso apenas para `authenticated`.

## Funcionalidades

- Login com email e senha (Supabase Auth)
- Solicitacao/aprovacao/recusa de usuarios
- Alteracao de perfil de usuario (admin/barman)
- Mover aprovados para recusados
- Estoque por lote e por bar (Bar Principal, Bar Piscina, Bar Praia)
- Cadastro de bebidas (admin)
- Edicao e exclusao de bebidas cadastradas (admin)
- Entrada de lotes com validade
- Dashboard com alertas (<=30 dias e <=7 dias)
- Alerta critico persistente e minimizavel
- Baixa de produto por quantidade
- Filtro por bar e ordenacao por validade
- PWA instalavel + offline basico (service worker)
- Tema claro/escuro

## Estrutura local

No fallback local (sem Supabase), a app usa:

- `users`
- `pendingUsers`
- `rejectedUsers`
- `bebidas`
- `lotes`
- `currentUser`
- `theme`
