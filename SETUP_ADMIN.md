# Configuração do Primeiro Usuário Admin

Após a integração com o Lovable Cloud, você precisa criar seu primeiro usuário administrador.

## Opção 1: Usando a Tela de Cadastro (Recomendado)

1. Acesse a aplicação
2. Clique na aba "Cadastrar"
3. Preencha o formulário com seus dados
4. Após criar a conta, acesse o backend do Lovable Cloud
5. No backend, vá até a tabela `user_roles`
6. Insira um novo registro:
   - `user_id`: ID do usuário que você acabou de criar (copie da tabela `auth.users`)
   - `role`: `admin`

## Opção 2: Usando SQL Direto no Backend

Se você já tiver criado uma conta, pode executar este SQL no backend do Lovable Cloud:

```sql
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário da tabela auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

## Como Encontrar seu User ID

1. Abra o backend do Lovable Cloud
2. Navegue até a tabela `auth.users`
3. Encontre seu email e copie o valor da coluna `id`
4. Use esse ID no SQL acima

## Próximos Passos

Depois de criar o usuário admin:

1. Faça login com suas credenciais
2. Como admin, você terá acesso a:
   - Cadastro de Associados
   - Gestão Financeira
   - Relatórios
   - Agenda
   - Configurações do Sistema

3. Na tela de Configurações, você poderá criar outros usuários do sistema e definir seus níveis de acesso.

## Importante

- Apenas usuários com role `admin` têm acesso completo ao sistema
- Usuários com role `associado` têm acesso limitado (Dashboard e Agenda - visualização)
- Sempre mantenha ao menos um usuário admin ativo no sistema
