-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'associado');

-- Criar enum para status do associado
CREATE TYPE public.associado_status AS ENUM ('ativo', 'inativo');

-- Criar enum para tipo de transação
CREATE TYPE public.transacao_tipo AS ENUM ('receita', 'despesa');

-- Criar enum para parentesco
CREATE TYPE public.parentesco AS ENUM ('cônjuge', 'filho(a)', 'pai/mãe', 'irmão/irmã', 'outro');

-- Tabela de roles dos usuários (CRÍTICO: separada para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Tabela de perfis dos usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de associados
CREATE TABLE public.associados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
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
  status associado_status DEFAULT 'ativo',
  data_associacao DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de familiares
CREATE TABLE public.familiares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id UUID REFERENCES public.associados(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  parentesco parentesco NOT NULL,
  data_nascimento DATE NOT NULL,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de categorias do plano de contas
CREATE TABLE public.categorias_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo transacao_tipo NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de lançamentos financeiros
CREATE TABLE public.lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo transacao_tipo NOT NULL,
  categoria_id UUID REFERENCES public.categorias_contas(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de agendamentos de aluguel
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  nome_responsavel TEXT NOT NULL,
  contato TEXT NOT NULL,
  observacoes TEXT,
  valor_cobrado DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função de segurança para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_associados_updated_at
  BEFORE UPDATE ON public.associados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_familiares_updated_at
  BEFORE UPDATE ON public.familiares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categorias_contas_updated_at
  BEFORE UPDATE ON public.categorias_contas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lancamentos_financeiros_updated_at
  BEFORE UPDATE ON public.lancamentos_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente ao criar usuário
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

-- Trigger para criar perfil ao criar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS em todas as tabelas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies para user_roles
CREATE POLICY "Usuários podem ver seus próprios roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins podem atualizar todos os perfis"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sistema pode inserir perfis"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies para associados (apenas admin tem acesso completo)
CREATE POLICY "Admins podem ver todos os associados"
  ON public.associados FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir associados"
  ON public.associados FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar associados"
  ON public.associados FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar associados"
  ON public.associados FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para familiares (apenas admin)
CREATE POLICY "Admins podem ver todos os familiares"
  ON public.familiares FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir familiares"
  ON public.familiares FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar familiares"
  ON public.familiares FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar familiares"
  ON public.familiares FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para categorias_contas (admin gerencia, todos podem ver)
CREATE POLICY "Todos podem ver categorias"
  ON public.categorias_contas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem inserir categorias"
  ON public.categorias_contas FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar categorias"
  ON public.categorias_contas FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar categorias"
  ON public.categorias_contas FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para lancamentos_financeiros (admin gerencia, todos podem ver)
CREATE POLICY "Todos podem ver lançamentos"
  ON public.lancamentos_financeiros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem inserir lançamentos"
  ON public.lancamentos_financeiros FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar lançamentos"
  ON public.lancamentos_financeiros FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar lançamentos"
  ON public.lancamentos_financeiros FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para agendamentos (todos podem ver, admin pode gerenciar)
CREATE POLICY "Todos podem ver agendamentos"
  ON public.agendamentos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem inserir agendamentos"
  ON public.agendamentos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar agendamentos"
  ON public.agendamentos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar agendamentos"
  ON public.agendamentos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Inserir categorias padrão
INSERT INTO public.categorias_contas (nome, tipo, descricao) VALUES
  ('Mensalidades', 'receita', 'Mensalidades dos associados'),
  ('Aluguel do Salão', 'receita', 'Receitas com aluguel do salão de festas'),
  ('Doações', 'receita', 'Doações recebidas'),
  ('Água e Luz', 'despesa', 'Contas de utilidades públicas'),
  ('Manutenção', 'despesa', 'Manutenção de instalações'),
  ('Salários', 'despesa', 'Pagamento de funcionários'),
  ('Material de Limpeza', 'despesa', 'Produtos de limpeza e higiene');