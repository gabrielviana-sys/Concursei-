# Concursei Web

Versão web do app Concursei, migrada do Electron para Next.js + Vercel.

## Stack

- Next.js 16 (App Router)
- Prisma 7 + SQLite (dev) / PostgreSQL (produção)
- NextAuth 4 (Credentials)
- @prisma/adapter-better-sqlite3 (dev) / @prisma/adapter-pg (produção)
- Google Gemini (resumos de PDF/texto)

## Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sua-chave-secreta-aqui-mude-no-deploy"
GEMINI_API_KEY="" # opcional; cada usuário pode configurar a própria chave em Configurações
```

## Desenvolvimento local

```bash
npm install
npx prisma migrate dev
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e crie uma conta em `/register`.

## Deploy na Vercel

1. Crie um projeto na Vercel apontando para este repositório.
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`: connection string do PostgreSQL (ex: Neon, Supabase, Vercel Postgres)
   - `NEXTAUTH_SECRET`: chave secreta forte
   - `GEMINI_API_KEY`: opcional
3. Use o comando de build:
   ```bash
   npm run build:vercel
   ```
4. A Vercel executará `npm run postinstall` automaticamente para gerar o Prisma Client.

## Estrutura

- `app/`: rotas e páginas do Next.js
- `app/api/`: API routes (auth, CRUD, stats, import, summarize)
- `components/`: componentes compartilhados (Layout, Sidebar, AppContext, TopicPanel)
- `lib/`: utilitários (auth, db, session, time)
- `prisma/`: schema e migrations

## Funcionalidades migradas

- Cadastro/login com email e senha
- Dashboard com estatísticas e gráficos
- Cadastro de matérias
- Registro de sessões de estudo (timer/pomodoro)
- Registro de questões e taxa de acerto
- Cronograma de estudos (visão mensal e lista)
- Anotações e resumos por tópico
- Geração de resumos com Google Gemini
- Importação de planilhas Excel

## Notas

- O upload de PDFs não é suportado nativamente no servidor sem binários adicionais. Na web, o texto do PDF pode ser colado manualmente no painel do tópico para gerar resumos.
- O middleware do NextAuth 4 ainda usa o padrão `middleware.js`; o Next.js 16 emite um aviso de deprecação, mas continua funcionando.
