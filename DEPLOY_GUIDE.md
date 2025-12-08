# Guia Completo de Implantação - Sistema de Gestão de Clubes

Este documento detalha passo a passo como levar o código para um repositório local, configurar um ambiente multi-tenant e disponibilizar o sistema para uso em produção.

---

## PARTE 1: Configurando o Repositório Local

### 1.1 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Git**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Node.js** (versão 18 ou superior): [https://nodejs.org/](https://nodejs.org/)
- **npm** ou **bun**: Gerenciador de pacotes
- **Docker Desktop**: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Supabase CLI**: Instalado via npm

### 1.2 Conectando ao GitHub

1. No editor Lovable, clique em **GitHub** no menu superior
2. Clique em **Connect to GitHub**
3. Autorize o aplicativo Lovable no GitHub
4. Selecione sua conta/organização do GitHub
5. Clique em **Create Repository** para criar o repositório

### 1.3 Clonando o Repositório Localmente

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# Entre na pasta do projeto
cd NOME_DO_REPO

# Instale as dependências
npm install
# ou
bun install
```

### 1.4 Estrutura do Projeto

```
projeto/
├── src/
│   ├── components/       # Componentes React
│   │   ├── associados/   # Componentes de associados
│   │   ├── dashboard/    # Componentes do dashboard
│   │   ├── financeiro/   # Componentes financeiros
│   │   ├── relatorios/   # Componentes de relatórios
│   │   └── ui/           # Componentes UI (shadcn)
│   ├── hooks/            # Hooks customizados
│   │   ├── useAuth.tsx   # Autenticação
│   │   ├── useAssociados.tsx
│   │   ├── useFinanceiro.tsx
│   │   └── useAgendamentos.tsx
│   ├── pages/            # Páginas da aplicação
│   ├── integrations/     # Configuração Supabase
│   └── types/            # Tipos TypeScript
├── supabase/
│   ├── config.toml       # Configuração Supabase
│   └── migrations/       # Migrações do banco
├── public/               # Arquivos estáticos
└── package.json
```

### 1.5 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa linting do código |

---

## PARTE 2: Configurando o Supabase Local

### 2.1 Instalando o Supabase CLI

```bash
# Via NPM (recomendado)
npm install -g supabase

# Verificar instalação
supabase --version
```

### 2.2 Inicializando o Supabase Local

```bash
# Inicializar Supabase (se não existir pasta supabase/)
supabase init

# Iniciar os serviços Docker do Supabase
supabase start
```

Após iniciar, você verá informações importantes:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**GUARDE ESSAS INFORMAÇÕES!**

### 2.3 Configurando Variáveis de Ambiente Locais

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações para ambiente LOCAL
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY_LOCAL
```

### 2.4 Aplicando as Migrações

```bash
# Aplicar todas as migrações
supabase db reset

# Ou aplicar apenas as novas migrações
supabase migration up
```

### 2.5 Acessando o Studio Local

Acesse **http://127.0.0.1:54323** para gerenciar seu banco de dados local.

### 2.6 Exportando Dados do Cloud para Local

```bash
# Conectar ao projeto cloud
supabase link --project-ref SEU_PROJECT_REF

# Puxar schema remoto
supabase db pull

# Fazer dump dos dados
supabase db dump -f backup.sql --data-only

# Restaurar no local
psql -h localhost -p 54322 -U postgres -d postgres -f backup.sql
```

---

## PARTE 3: Configurando Multi-Tenant

### 3.1 Conceito Multi-Tenant

O sistema multi-tenant permite que múltiplas organizações (clubes) utilizem a mesma aplicação com dados completamente isolados. Usamos **Row-Level Security (RLS)** para garantir o isolamento.

### 3.2 Migração 1: Criar Tabelas de Tenant

Execute no Supabase Studio ou via migration:

```sql
-- =====================================================
-- Criar tabelas de tenant
-- =====================================================

-- Tabela de tenants (clubes/organizações)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  configuracoes JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de membros do tenant
CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- Índices para performance
CREATE INDEX idx_tenant_members_user ON public.tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant ON public.tenant_members(tenant_id);

-- Políticas para tenants
CREATE POLICY "Members can view their tenant"
ON public.tenants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = id AND user_id = auth.uid()
  )
);

-- Políticas para tenant_members
CREATE POLICY "Users can view their memberships"
ON public.tenant_members FOR SELECT
USING (user_id = auth.uid());
```

### 3.3 Migração 2: Funções Auxiliares

```sql
-- =====================================================
-- Funções auxiliares para multi-tenant
-- =====================================================

-- Função para obter tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id 
  FROM public.tenant_members 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Função para verificar se usuário pertence ao tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(check_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tenant_members 
    WHERE user_id = auth.uid() 
    AND tenant_id = check_tenant_id
  )
$$;
```

### 3.4 Migração 3: Adicionar tenant_id às Tabelas

```sql
-- =====================================================
-- Adicionar tenant_id às tabelas existentes
-- =====================================================

-- Adicionar coluna tenant_id em cada tabela
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.familiares ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.categorias_contas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.lancamentos_financeiros ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Criar índices para tenant_id
CREATE INDEX IF NOT EXISTS idx_associados_tenant ON public.associados(tenant_id);
CREATE INDEX IF NOT EXISTS idx_familiares_tenant ON public.familiares(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON public.categorias_contas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tenant ON public.lancamentos_financeiros(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_tenant ON public.agendamentos(tenant_id);
```

### 3.5 Migração 4: Atualizar Políticas RLS

```sql
-- =====================================================
-- Atualizar políticas RLS para multi-tenant
-- =====================================================

-- ASSOCIADOS
DROP POLICY IF EXISTS "Admins podem ver todos os associados" ON public.associados;
DROP POLICY IF EXISTS "Admins podem inserir associados" ON public.associados;
DROP POLICY IF EXISTS "Admins podem atualizar associados" ON public.associados;
DROP POLICY IF EXISTS "Admins podem deletar associados" ON public.associados;

CREATE POLICY "Tenant members can view associados"
ON public.associados FOR SELECT
USING (user_belongs_to_tenant(tenant_id));

CREATE POLICY "Tenant admins can insert associados"
ON public.associados FOR INSERT
WITH CHECK (
  user_belongs_to_tenant(tenant_id) 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Tenant admins can update associados"
ON public.associados FOR UPDATE
USING (
  user_belongs_to_tenant(tenant_id) 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Tenant admins can delete associados"
ON public.associados FOR DELETE
USING (
  user_belongs_to_tenant(tenant_id) 
  AND has_role(auth.uid(), 'admin')
);

-- Repita para: familiares, categorias_contas, lancamentos_financeiros, agendamentos
```

### 3.6 Hook useTenant para o Frontend

Crie o arquivo `src/hooks/useTenant.tsx`:

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Tenant {
  id: string;
  nome: string;
  slug: string;
  logo_url?: string;
  configuracoes?: Record<string, any>;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  error: null,
});

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!user) {
        setTenant(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tenant_members')
          .select(`tenant:tenants(*)`)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setTenant(data?.tenant as Tenant);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
```

---

## PARTE 4: Deploy em Produção

### 4.1 Opção 1: Lovable (Recomendado)

1. No editor Lovable, clique em **Publish** (canto superior direito)
2. Clique em **Update** para publicar as alterações
3. Seu app estará disponível em `https://seu-projeto.lovable.app`

Para conectar um domínio customizado:
1. Vá em **Project > Settings > Domains**
2. Adicione seu domínio (ex: `app.seuclube.com.br`)
3. Configure os registros DNS conforme instruído

### 4.2 Opção 2: Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Import Project**
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente:
   ```
   VITE_SUPABASE_URL=sua_url_supabase_cloud
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
   ```
5. Clique em **Deploy**

### 4.3 Opção 3: Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em **Add new site > Import an existing project**
3. Conecte ao GitHub e selecione o repositório
4. Configurações de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Adicione as variáveis de ambiente
6. Clique em **Deploy**

### 4.4 Opção 4: Docker (Self-Hosted)

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Comandos para deploy:**

```bash
# Build da imagem
docker build -t sistema-clube .

# Executar container
docker run -d -p 80:80 --name sistema-clube sistema-clube

# Com Docker Compose (recomendado)
docker-compose up -d
```

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

---

## PARTE 5: Configuração Inicial do Sistema

### 5.1 Criando o Primeiro Tenant

```sql
-- Inserir o primeiro tenant (clube)
INSERT INTO public.tenants (nome, slug)
VALUES ('Clube Principal', 'clube-principal')
RETURNING id;

-- Guarde o ID retornado!
```

### 5.2 Criando o Primeiro Usuário Admin

1. Acesse o sistema e cadastre-se pela tela de login
2. Execute no banco de dados:

```sql
-- Obter o ID do usuário recém-criado
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Adicionar role de admin (substitua ID_DO_USUARIO)
INSERT INTO public.user_roles (user_id, role)
VALUES ('ID_DO_USUARIO', 'admin');

-- Associar ao tenant (substitua IDs)
INSERT INTO public.tenant_members (tenant_id, user_id, role)
VALUES (
  'ID_DO_TENANT',
  'ID_DO_USUARIO',
  'owner'
);
```

### 5.3 Checklist de Deploy

- [ ] Repositório conectado ao GitHub
- [ ] Código clonado localmente
- [ ] Dependências instaladas (`npm install`)
- [ ] Supabase configurado (local ou cloud)
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações aplicadas
- [ ] Tabelas de tenant criadas (para multi-tenant)
- [ ] Primeiro tenant criado
- [ ] Primeiro usuário admin configurado
- [ ] RLS policies verificadas
- [ ] Teste de login funcionando
- [ ] Teste de criação de associado funcionando
- [ ] Teste de lançamentos financeiros funcionando
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL/HTTPS habilitado (automático em Lovable/Vercel/Netlify)

---

## PARTE 6: Comandos Úteis

### Supabase CLI

```bash
# Iniciar Supabase local
supabase start

# Parar Supabase local
supabase stop

# Ver status dos serviços
supabase status

# Criar nova migração
supabase migration new nome_da_migracao

# Aplicar migrações
supabase migration up

# Resetar banco (aplica todas as migrações do zero)
supabase db reset

# Gerar tipos TypeScript
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Fazer dump do banco para backup
supabase db dump -f backup.sql

# Restaurar backup
psql -h localhost -p 54322 -U postgres -d postgres -f backup.sql

# Ver logs
supabase logs
```

### Git

```bash
# Verificar alterações
git status

# Adicionar alterações
git add .

# Commit
git commit -m "Descrição das alterações"

# Enviar para GitHub
git push origin main

# Puxar alterações do Lovable
git pull origin main

# Criar branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main
```

### npm

```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## PARTE 7: Troubleshooting

### Problema: Docker não inicia

```bash
# Reiniciar Docker Desktop
# Depois:
supabase stop --no-backup
supabase start
```

### Problema: Portas em uso

```bash
# Windows - verificar processos nas portas
netstat -ano | findstr :54321

# Linux/Mac
lsof -i :54321

# Parar Supabase e reiniciar
supabase stop --no-backup
supabase start
```

### Problema: Migrações falhando

```bash
# Verificar logs
supabase db reset --debug

# Acessar o Studio e verificar manualmente
# http://127.0.0.1:54323
```

### Problema: RLS bloqueando acesso

```sql
-- Verificar se usuário tem role
SELECT * FROM public.user_roles WHERE user_id = 'ID_DO_USUARIO';

-- Verificar se usuário pertence ao tenant
SELECT * FROM public.tenant_members WHERE user_id = 'ID_DO_USUARIO';

-- Testar política manualmente
SELECT public.user_belongs_to_tenant('TENANT_ID');
SELECT public.get_user_tenant_id();
```

### Problema: Erro ao criar usuário

```sql
-- Verificar se profile foi criado
SELECT * FROM public.profiles WHERE id = 'USER_ID';

-- Verificar trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Problema: Lançamentos não salvam

- Verifique se existe uma categoria criada
- Verifique se o usuário tem role 'admin'
- Verifique o console do navegador para erros

---

## Recursos Adicionais

- [Documentação Lovable](https://docs.lovable.dev/)
- [Documentação Supabase](https://supabase.com/docs)
- [Guia RLS Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Guia Multi-Tenant](https://supabase.com/docs/guides/getting-started/architecture#multi-tenancy)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

**Última atualização:** Dezembro 2024
