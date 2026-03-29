# CRM Pro

CRM completo inspirado no Bitrix24 para equipes pequenas (2-5 pessoas).
Foco em **Vendas** (funil/pipeline), **Pós-Venda** (customer success) e **Suporte** (tickets).

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: TailwindCSS v4 + shadcn/ui
- **Backend/DB/Auth**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Estado**: Zustand
- **Roteamento**: React Router v7
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Drag & Drop**: @dnd-kit
- **Calendário**: react-big-calendar
- **Rich Text**: TipTap
- **Exportação**: SheetJS (Excel) + jsPDF (PDF)

## Instalação

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd crm-pro

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# 4. Configurar o banco de dados
# No dashboard do Supabase, execute:
# - supabase/schema.sql (cria tabelas, triggers, RLS, views)
# - supabase/seed.sql (dados de exemplo)

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (anon key) do Supabase |

## Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute `supabase/schema.sql`
3. Execute `supabase/seed.sql` para dados de exemplo
4. Em Authentication > Settings, habilite Email/Password
5. Copie a URL e anon key para o `.env`

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/         # Componentes shadcn/ui
│   ├── layout/     # Sidebar, TopBar, MainLayout
│   └── shared/     # PrivateRoute, componentes compartilhados
├── pages/
│   ├── auth/       # Login, Register, ForgotPassword, Profile
│   └── dashboard/  # Dashboard principal
├── hooks/          # useAuth, useNotifications
├── services/       # Chamadas ao Supabase
├── stores/         # Zustand stores
├── types/          # TypeScript interfaces
└── lib/            # Utilitários
```

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Linting
```

## Licença

Uso privado.
