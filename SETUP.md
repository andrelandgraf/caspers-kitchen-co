# Caspers Kitchen - Setup Instructions

Ghost kitchen demo app showcasing Databricks capabilities. Built with Next.js 16, Neon Postgres, Drizzle ORM, and AI SDK.

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Runtime:** Bun
- **Database:** Neon Postgres + Drizzle ORM
- **Auth:** Better Auth (email/password with verification)
- **Email:** Resend
- **AI:** Vercel AI SDK v6
- **UI:** Shadcn UI + Tailwind CSS v4
- **Theming:** Databricks brand colors (red/orange primary)

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your credentials

# Create .env.local for local overrides
echo 'BETTER_AUTH_URL="http://localhost:3000"' > .env.local

# Generate auth schema and run migrations
bun run db:generate
bun run db:migrate

# Start development server
bun run dev
```

## Environment Variables

### Required in `.env.development`

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://..."

# AI Gateway
AI_GATEWAY_API_KEY="vck_..."

# Auth
BETTER_AUTH_SECRET="<generate with: openssl rand -base64 32>"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Caspers Kitchen <noreply@yourdomain.com>"
```

### Required in `.env.local` (local only)

```env
BETTER_AUTH_URL="http://localhost:3000"
```

### Vercel Environment Variables

Set these in Vercel dashboard:

- `DATABASE_URL`
- `AI_GATEWAY_API_KEY`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (your production URL)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/   # Better Auth handler
│   │   └── chat/            # AI chat endpoint
│   ├── sign-in/             # Auth pages
│   ├── sign-up/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── verify-email/
│   ├── profile/             # Account settings (protected)
│   └── page.tsx             # Landing page with chat
├── components/
│   ├── auth/                # Auth UI components
│   ├── profile/             # Profile management
│   ├── themes/              # Theme provider & selector
│   └── ui/                  # Shadcn components
├── lib/
│   ├── ai/                  # AI SDK config
│   ├── auth/                # Better Auth setup
│   │   ├── client.ts        # React hooks
│   │   ├── config.ts        # Env validation
│   │   ├── server.tsx       # Auth instance
│   │   ├── schema.ts        # Generated DB schema
│   │   └── emails/          # Email templates
│   ├── config/              # Config schema utilities
│   ├── db/                  # Drizzle setup
│   │   ├── client.ts        # DB connection
│   │   ├── config.ts        # Env validation
│   │   └── migrations/      # SQL migrations
│   └── resend/              # Email client
└── scripts/
    └── db/generate-schema.ts
```

## Scripts

```bash
bun run dev              # Start dev server
bun run build            # Production build
bun run typecheck        # TypeScript check
bun run fmt              # Format with Prettier

bun run db:generate      # Generate auth schema + migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

bun run env:validate     # Validate dev environment
bun run env:validate:prod # Validate prod environment
```

## Authentication Features

- Email/password sign up with verification
- Password reset via email
- Email change with confirmation
- Account deletion with verification
- Session management
- Profile editing (name, photo)
- Dark/light theme toggle

## Deployment

The project is configured for Vercel with:

- Bun as package manager and runtime
- Automatic deployments on push
- Git integration

```bash
# Initial deploy
vercel

# Connect GitHub for auto-deploy
vercel git connect
```

## Key Files Changed

| File                      | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `vercel.ts`               | Vercel config with Bun runtime                |
| `drizzle.config.ts`       | Drizzle Kit configuration                     |
| `agents.md`               | AI coding guidelines                          |
| `.cursor/mcp.json`        | MCP server configuration                      |
| `src/lib/auth/server.tsx` | Better Auth with Drizzle adapter + schema     |
| `src/lib/db/client.ts`    | Drizzle client with Vercel connection pooling |

## Theming

Uses Databricks brand colors:

- **Primary:** `oklch(0.6 0.22 28)` (Databricks red/orange)
- **Dark mode:** Slate-based with orange accents

CSS variables in `src/app/globals.css`.
