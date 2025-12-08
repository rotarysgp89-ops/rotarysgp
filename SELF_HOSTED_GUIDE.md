# Manual de Deploy Self-Hosted - Sistema de Gestão de Clubes

Este guia detalha como subir o backend e banco de dados em um servidor próprio, sem dependência do Lovable.

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalação do Supabase Self-Hosted](#2-instalação-do-supabase-self-hosted)
3. [Configuração do Banco de Dados](#3-configuração-do-banco-de-dados)
4. [Migrações do Banco](#4-migrações-do-banco)
5. [Deploy das Edge Functions](#5-deploy-das-edge-functions)
6. [Configuração do Frontend](#6-configuração-do-frontend)
7. [Criação do Primeiro Usuário Admin](#7-criação-do-primeiro-usuário-admin)
8. [Backup e Manutenção](#8-backup-e-manutenção)

---

## 1. Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Comando de Verificação |
|----------|---------------|------------------------|
| Docker | 20.10+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| Git | 2.30+ | `git --version` |
| Node.js | 18+ | `node --version` |
| Supabase CLI | 1.150+ | `supabase --version` |

### Instalação do Docker (Ubuntu/Debian)

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Instalação do Supabase CLI

```bash
# Via NPM (recomendado)
npm install -g supabase

# Ou via Homebrew (macOS/Linux)
brew install supabase/tap/supabase
```

---

## 2. Instalação do Supabase Self-Hosted

### 2.1. Clonar o Repositório do Supabase

```bash
# Criar diretório para o Supabase
mkdir -p /opt/supabase
cd /opt/supabase

# Clonar repositório oficial
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
```

### 2.2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

### 2.3. Variáveis Importantes para Configurar

```env
############
# Secrets - ALTERE TODOS ESTES VALORES EM PRODUÇÃO!
############

# Senha do PostgreSQL
POSTGRES_PASSWORD=sua_senha_super_segura_aqui

# JWT Secret - Use um valor aleatório de 32+ caracteres
JWT_SECRET=sua_chave_jwt_super_secreta_com_32_caracteres_ou_mais

# Chave de API Anon - Gere usando: openssl rand -base64 32
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave de API Service Role - Gere usando: openssl rand -base64 32
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Dashboard
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=sua_senha_do_dashboard

############
# URLs - Configure para seu domínio
############

# URL da API (substitua pelo IP/domínio do seu servidor)
API_EXTERNAL_URL=http://SEU_IP_OU_DOMINIO:8000

# URL do Site
SITE_URL=http://SEU_IP_OU_DOMINIO:3000

############
# Email (Opcional - para confirmação de email)
############

SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu_usuario
SMTP_PASS=sua_senha
SMTP_SENDER_NAME=Sistema de Gestão de Clubes
```

### 2.4. Gerar Chaves JWT

```bash
# Instalar ferramenta de geração (se necessário)
npm install -g @supabase/cli

# Gerar JWT Secret
openssl rand -base64 32

# Gerar ANON_KEY e SERVICE_ROLE_KEY
# Use o site: https://supabase.com/docs/guides/self-hosting#api-keys
# Ou execute:
supabase gen keys
```

### 2.5. Iniciar os Containers

```bash
# Subir todos os serviços
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

### 2.6. Serviços e Portas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Kong (API Gateway) | 8000 | Ponto de entrada da API |
| PostgreSQL | 5432 | Banco de dados |
| Supabase Studio | 3000 | Dashboard de administração |
| GoTrue (Auth) | 9999 | Serviço de autenticação |
| PostgREST | 3001 | API REST automática |
| Realtime | 4000 | WebSockets |
| Storage | 5000 | Armazenamento de arquivos |

---

## 3. Configuração do Banco de Dados

### 3.1. Acessar o PostgreSQL

```bash
# Via Docker
docker exec -it supabase-db psql -U postgres

# Ou via psql local
psql -h localhost -p 5432 -U postgres -d postgres
```

### 3.2. Criar Extensões Necessárias

```sql
-- Conectar ao banco
\c postgres

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 4. Migrações do Banco

### 4.1. SQL de Criação das Tabelas

Execute os seguintes comandos SQL no Supabase Studio ou via psql:

```sql
-- ============================================
-- ENUMS (Tipos customizados)
-- ============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'associado');
CREATE TYPE public.associado_status AS ENUM ('ativo', 'inativo');
CREATE TYPE public.parentesco AS ENUM ('cônjuge', 'filho(a)', 'pai/mãe', 'irmão/irmã', 'outro');
CREATE TYPE public.transacao_tipo AS ENUM ('receita', 'despesa');

-- ============================================
-- TABELA: profiles (Perfis de usuários)
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: user_roles (Papéis dos usuários)
-- ============================================

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: associados
-- ============================================

CREATE TABLE public.associados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    rg TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    data_associacao DATE DEFAULT CURRENT_DATE,
    status public.associado_status DEFAULT 'ativo',
    endereco_rua TEXT NOT NULL,
    endereco_numero TEXT NOT NULL,
    endereco_complemento TEXT,
    endereco_bairro TEXT NOT NULL,
    endereco_cidade TEXT NOT NULL,
    endereco_estado TEXT NOT NULL,
    endereco_cep TEXT NOT NULL,
    contato_telefone TEXT NOT NULL,
    contato_celular TEXT NOT NULL,
    contato_email TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.associados ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: familiares
-- ============================================

CREATE TABLE public.familiares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cpf TEXT,
    data_nascimento DATE NOT NULL,
    parentesco public.parentesco NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.familiares ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: categorias_contas
-- ============================================

CREATE TABLE public.categorias_contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    tipo public.transacao_tipo NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.categorias_contas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: lancamentos_financeiros
-- ============================================

CREATE TABLE public.lancamentos_financeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    data DATE NOT NULL,
    tipo public.transacao_tipo NOT NULL,
    categoria_id UUID REFERENCES public.categorias_contas(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: agendamentos
-- ============================================

CREATE TABLE public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    nome_responsavel TEXT NOT NULL,
    contato TEXT NOT NULL,
    valor_cobrado NUMERIC,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNÇÕES
-- ============================================

-- Função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para criar perfil ao registrar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_associados_updated_at
  BEFORE UPDATE ON public.associados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_familiares_updated_at
  BEFORE UPDATE ON public.familiares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON public.categorias_contas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lancamentos_updated_at
  BEFORE UPDATE ON public.lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- PROFILES
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins podem atualizar todos os perfis"
  ON public.profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Sistema pode inserir perfis"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- USER_ROLES
CREATE POLICY "Usuários podem ver seus próprios roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar roles"
  ON public.user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ASSOCIADOS
CREATE POLICY "Admins podem ver todos os associados"
  ON public.associados FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir associados"
  ON public.associados FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar associados"
  ON public.associados FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar associados"
  ON public.associados FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- FAMILIARES
CREATE POLICY "Admins podem ver todos os familiares"
  ON public.familiares FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir familiares"
  ON public.familiares FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar familiares"
  ON public.familiares FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar familiares"
  ON public.familiares FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- CATEGORIAS_CONTAS
CREATE POLICY "Todos podem ver categorias"
  ON public.categorias_contas FOR SELECT
  USING (true);

CREATE POLICY "Admins podem inserir categorias"
  ON public.categorias_contas FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar categorias"
  ON public.categorias_contas FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar categorias"
  ON public.categorias_contas FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- LANCAMENTOS_FINANCEIROS
CREATE POLICY "Todos podem ver lançamentos"
  ON public.lancamentos_financeiros FOR SELECT
  USING (true);

CREATE POLICY "Admins podem inserir lançamentos"
  ON public.lancamentos_financeiros FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar lançamentos"
  ON public.lancamentos_financeiros FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar lançamentos"
  ON public.lancamentos_financeiros FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- AGENDAMENTOS
CREATE POLICY "Todos podem ver agendamentos"
  ON public.agendamentos FOR SELECT
  USING (true);

CREATE POLICY "Admins podem inserir agendamentos"
  ON public.agendamentos FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar agendamentos"
  ON public.agendamentos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar agendamentos"
  ON public.agendamentos FOR DELETE
  USING (has_role(auth.uid(), 'admin'));
```

---

## 5. Deploy das Edge Functions

### 5.1. Estrutura das Edge Functions

Copie a pasta `supabase/functions` do projeto para o servidor:

```
supabase/functions/
├── create-user/
│   └── index.ts
└── manage-user/
    └── index.ts
```

### 5.2. Código da Função create-user

```typescript
// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      throw new Error('Not authorized - admin only')
    }

    const { email, password, nome, role } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome }
    })

    if (createError) {
      throw createError
    }

    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: newUser.user.id, role })

    if (roleInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw roleInsertError
    }

    return new Response(
      JSON.stringify({ user: newUser.user, message: 'User created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 5.3. Código da Função manage-user

```typescript
// supabase/functions/manage-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!roleData) {
      throw new Error('Not authorized - admin only')
    }

    const { action, userId, userData } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (action === 'update') {
      const { nome, email, role, ativo } = userData

      await supabaseAdmin
        .from('profiles')
        .update({ nome, email, ativo })
        .eq('id', userId)

      if (role) {
        await supabaseAdmin
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId)
      }

      return new Response(
        JSON.stringify({ message: 'User updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'delete') {
      if (userId === user.id) {
        throw new Error('Cannot delete yourself')
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error

      return new Response(
        JSON.stringify({ message: 'User deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 5.4. Deploy das Functions

```bash
# Navegar para pasta do projeto
cd /caminho/do/projeto

# Linkar projeto (use suas credenciais)
supabase link --project-ref SEU_PROJECT_REF

# Fazer deploy das functions
supabase functions deploy create-user
supabase functions deploy manage-user

# Verificar status
supabase functions list
```

---

## 6. Configuração do Frontend

### 6.1. Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto frontend:

```env
# URL do Supabase (seu servidor)
VITE_SUPABASE_URL=http://SEU_IP_OU_DOMINIO:8000

# Chave pública (ANON_KEY)
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key_aqui

# ID do projeto (opcional para self-hosted)
VITE_SUPABASE_PROJECT_ID=local
```

### 6.2. Build do Frontend

```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Os arquivos estarão em /dist
```

### 6.3. Servir com Nginx

```nginx
# /etc/nginx/sites-available/clube-gestao

server {
    listen 80;
    server_name seu_dominio.com;
    root /var/www/clube-gestao/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API Supabase
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/clube-gestao /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Criação do Primeiro Usuário Admin

### 7.1. Via Supabase Studio

1. Acesse `http://SEU_IP:3000` (Supabase Studio)
2. Vá em **Authentication** → **Users** → **Add User**
3. Preencha email e senha
4. Clique em **Create User**

### 7.2. Inserir Role de Admin

```sql
-- Substituir 'USER_ID' pelo ID do usuário criado
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'admin');

-- Verificar
SELECT * FROM public.user_roles;
```

### 7.3. Script Automatizado

```bash
#!/bin/bash
# create_admin.sh

EMAIL="admin@exemplo.com"
PASSWORD="senha_segura_123"
NOME="Administrador"

# Criar usuário via API
curl -X POST "http://localhost:8000/auth/v1/signup" \
  -H "apikey: SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"data\": { \"nome\": \"$NOME\" }
  }"

echo "Usuário criado. Agora execute o SQL para adicionar role de admin."
```

---

## 8. Backup e Manutenção

### 8.1. Backup do Banco de Dados

```bash
# Backup completo
docker exec supabase-db pg_dump -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas dados (sem estrutura)
docker exec supabase-db pg_dump -U postgres -d postgres --data-only > backup_dados_$(date +%Y%m%d).sql

# Script de backup automático (cron)
# Adicionar ao crontab: crontab -e
# 0 2 * * * /opt/scripts/backup_supabase.sh
```

### 8.2. Restaurar Backup

```bash
# Restaurar backup
cat backup.sql | docker exec -i supabase-db psql -U postgres -d postgres
```

### 8.3. Monitoramento

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs específicos
docker compose logs -f db
docker compose logs -f rest
docker compose logs -f auth

# Verificar uso de recursos
docker stats
```

### 8.4. Atualização do Supabase

```bash
cd /opt/supabase/supabase/docker

# Parar serviços
docker compose down

# Atualizar repositório
git pull origin master

# Subir novamente
docker compose up -d
```

---

## 9. Checklist de Verificação

- [ ] Docker instalado e funcionando
- [ ] Supabase CLI instalado
- [ ] Containers Supabase rodando
- [ ] Banco de dados criado com todas as tabelas
- [ ] Edge functions deployadas
- [ ] Primeiro usuário admin criado
- [ ] Frontend configurado com URLs corretas
- [ ] Nginx configurado (produção)
- [ ] Backup configurado
- [ ] SSL/HTTPS configurado (produção)

---

## 10. Troubleshooting

### Problema: Containers não sobem

```bash
# Verificar logs
docker compose logs

# Reiniciar Docker
sudo systemctl restart docker

# Limpar e reiniciar
docker compose down -v
docker compose up -d
```

### Problema: Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep supabase-db

# Verificar porta
netstat -tlnp | grep 5432
```

### Problema: Edge Functions não funcionam

```bash
# Verificar deploy
supabase functions list

# Ver logs
supabase functions logs create-user
```

---

## Suporte

Para dúvidas e suporte:
- Documentação Supabase: https://supabase.com/docs
- GitHub Issues: https://github.com/supabase/supabase/issues
