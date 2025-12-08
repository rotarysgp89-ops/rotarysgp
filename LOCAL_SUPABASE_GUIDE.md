# Guia: Supabase Local (Self-Hosted)

## 📋 Pré-requisitos

- **Docker Desktop** instalado e rodando
- **Node.js** 18+
- **Git**
- **Supabase CLI**

---

## 🚀 Passo 1: Instalar Supabase CLI

```bash
# Via NPM (recomendado)
npm install -g supabase

# Via Homebrew (macOS)
brew install supabase/tap/supabase

# Via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

## 🐳 Passo 2: Iniciar Supabase Local

```bash
# Na pasta do projeto
cd seu-projeto

# Inicializar Supabase (se ainda não existir pasta supabase/)
supabase init

# Iniciar os containers Docker
supabase start
```

Após executar `supabase start`, você verá:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📁 Passo 3: Estrutura de Arquivos do Backend

Após clonar o repositório, a estrutura do backend está em:

```
seu-projeto/
├── supabase/
│   ├── config.toml              # Configuração do projeto
│   ├── migrations/              # Migrações SQL (schema do banco)
│   │   ├── 20251125115529_*.sql # Tabelas, enums, funções
│   │   └── 20251125115644_*.sql # Triggers, profiles
│   └── functions/               # Edge Functions (se houver)
│       └── nome-funcao/
│           └── index.ts
├── src/
│   └── integrations/
│       └── supabase/
│           ├── client.ts        # Cliente Supabase
│           └── types.ts         # Tipos TypeScript
└── .env                         # Variáveis de ambiente
```

---

## 🔧 Passo 4: Aplicar Migrações Localmente

```bash
# Aplicar todas as migrações existentes
supabase db reset

# Ou aplicar migrações pendentes
supabase migration up
```

---

## ⚙️ Passo 5: Configurar Variáveis de Ambiente

Crie/atualize o arquivo `.env.local`:

```env
# URLs Locais
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_anon_key_local"

# Para produção (Lovable Cloud)
# VITE_SUPABASE_URL="https://evsduwotudioznfdnqna.supabase.co"
# VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIs..."
```

---

## 🖥️ Passo 6: Acessar Supabase Studio Local

Acesse **http://127.0.0.1:54323** no navegador para:

- Visualizar/editar tabelas
- Executar SQL
- Gerenciar autenticação
- Ver logs
- Gerenciar storage

---

## 📊 Schema do Banco de Dados

### Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| `associados` | Cadastro de sócios |
| `familiares` | Familiares dos associados |
| `categorias_contas` | Categorias financeiras |
| `lancamentos_financeiros` | Transações financeiras |
| `agendamentos` | Agenda de eventos |
| `profiles` | Perfis de usuários |
| `user_roles` | Papéis de acesso (admin/associado) |

### Enums

```sql
-- Tipos de usuário
CREATE TYPE app_role AS ENUM ('admin', 'associado');

-- Status do associado
CREATE TYPE associado_status AS ENUM ('ativo', 'inativo');

-- Parentesco
CREATE TYPE parentesco AS ENUM ('cônjuge', 'filho(a)', 'pai/mãe', 'irmão/irmã', 'outro');

-- Tipo de transação
CREATE TYPE transacao_tipo AS ENUM ('receita', 'despesa');
```

---

## 🔄 Comandos Úteis

```bash
# Iniciar Supabase
supabase start

# Parar Supabase
supabase stop

# Ver status
supabase status

# Criar nova migração
supabase migration new nome_da_migracao

# Resetar banco (aplica todas migrações do zero)
supabase db reset

# Gerar tipos TypeScript
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Ver logs das Edge Functions
supabase functions serve

# Deploy de Edge Functions (produção)
supabase functions deploy nome-funcao
```

---

## 🔐 Criar Primeiro Usuário Admin

1. Acesse Supabase Studio: http://127.0.0.1:54323
2. Vá em **Authentication** → **Users** → **Add User**
3. Crie o usuário com email e senha
4. Execute no **SQL Editor**:

```sql
-- Substitua 'UUID_DO_USUARIO' pelo ID do usuário criado
INSERT INTO public.profiles (id, nome, email)
VALUES ('UUID_DO_USUARIO', 'Administrador', 'admin@clube.com');

INSERT INTO public.user_roles (user_id, role)
VALUES ('UUID_DO_USUARIO', 'admin');
```

---

## 🌐 Alternar entre Local e Cloud

### Desenvolvimento Local
```env
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_anon_key_local"
```

### Produção (Lovable Cloud)
```env
VITE_SUPABASE_URL="https://evsduwotudioznfdnqna.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c2R1d290dWRpb3puZmRucW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjEyNjEsImV4cCI6MjA3OTYzNzI2MX0.reyNXIz3vRjwW684pvERscrCczbOA18eRwz79GAHVJM"
```

---

## 📦 Exportar Dados do Cloud para Local

```bash
# Conectar ao projeto remoto
supabase link --project-ref evsduwotudioznfdnqna

# Baixar schema remoto
supabase db pull

# Dump completo (schema + dados)
supabase db dump -f dump.sql

# Restaurar localmente
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < dump.sql
```

---

## ❗ Troubleshooting

### Docker não inicia
```bash
# Verificar se Docker está rodando
docker ps

# Reiniciar containers
supabase stop
supabase start
```

### Porta já em uso
```bash
# Verificar portas
netstat -an | grep 54321

# Alterar portas no supabase/config.toml
[api]
port = 54321  # Altere se necessário
```

### Migrações com erro
```bash
# Resetar completamente
supabase db reset

# Ver logs detalhados
supabase db reset --debug
```

---

## 📚 Recursos

- [Documentação Supabase CLI](https://supabase.com/docs/reference/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Self-Hosting Supabase](https://supabase.com/docs/guides/self-hosting)
