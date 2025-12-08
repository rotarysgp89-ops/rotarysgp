# Sistema de Gestão de Clubes

Sistema completo para gestão de clubes associativos, desenvolvido com React, TypeScript e Tailwind CSS.

## 📋 Sobre o Projeto

Este sistema foi desenvolvido para facilitar a administração de clubes, oferecendo funcionalidades como:

- ✅ Gestão de Associados e Familiares
- ✅ Controle Financeiro (Receitas e Despesas)
- ✅ Plano de Contas
- ✅ Relatórios Gerenciais
- ✅ Agenda de Aluguel do Clube
- ✅ Gestão de Usuários do Sistema
- ✅ Controle de Acesso por Perfil (Admin e Associado)

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse o sistema no navegador:
```
http://localhost:8080
```

## 👤 Usuários Padrão

O sistema vem pré-configurado com dois usuários para demonstração:

### Administrador
- **Email:** admin@clube.com
- **Senha:** senha123
- **Permissões:** Acesso completo a todas as funcionalidades

### Associado
- **Email:** associado@clube.com
- **Senha:** senha456
- **Permissões:** Acesso limitado ao dashboard e agenda

## 📚 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes da biblioteca shadcn/ui
│   ├── dashboard/      # Componentes do dashboard
│   ├── associados/     # Componentes de gestão de associados
│   ├── financeiro/     # Componentes financeiros
│   └── relatorios/     # Componentes de relatórios
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Página de autenticação
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Associados.tsx  # Gestão de associados
│   ├── Financeiro.tsx  # Gestão financeira
│   ├── Relatorios.tsx  # Relatórios
│   ├── Agenda.tsx      # Agenda de aluguel
│   └── Configuracoes.tsx # Configurações do sistema
├── lib/                # Bibliotecas e utilitários
│   ├── auth.ts         # Funções de autenticação
│   ├── mockData.ts     # Dados mockados (temporário)
│   └── utils.ts        # Funções utilitárias
└── types/              # Definições TypeScript
```

## 🎨 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI acessíveis
- **React Router** - Roteamento
- **Lucide React** - Ícones
- **Sonner** - Toast notifications

## 🔐 Sistema de Autenticação

O sistema implementa autenticação baseada em localStorage (frontend-only). Os dados são validados contra usuários mockados.

**⚠️ IMPORTANTE:** Esta é uma implementação de demonstração. Para produção, é necessário integrar com uma API backend real com autenticação segura (JWT, OAuth, etc.).

## 📊 Funcionalidades por Módulo

### Dashboard
- Resumo financeiro com totais de receitas, despesas e saldo
- Atalhos para ações rápidas
- Últimos lançamentos financeiros (Admin)
- Próximos agendamentos (Associado)

### Gestão de Associados (Admin)
- Listagem de todos os associados
- Cadastro completo com dados pessoais, endereço e contato
- Gestão de familiares vinculados ao associado
- Busca por nome ou CPF
- Filtro por status (Ativo/Inativo)

### Financeiro (Admin)
- **Plano de Contas:** Cadastro de categorias de receitas e despesas
- **Lançamentos:** Registro de transações financeiras
- Visualização de totais e saldo
- Filtros por tipo (receita/despesa)

### Relatórios (Admin)
- **Relatório Financeiro:** Filtragem por período e tipo, com totais e detalhamento
- **Relatório de Associados:** Lista completa com dados e familiares para impressão

### Agenda de Aluguel
- Calendário visual mensal
- Visualização de disponibilidade
- Criação de agendamentos (Admin)
- Lista de próximos agendamentos

### Configurações (Admin)
- Gestão de usuários do sistema
- Criação de novos usuários
- Definição de níveis de acesso

## 🔄 Próximos Passos (Integração Backend)

Este projeto é um frontend completo pronto para integração. Para conectar com um backend real:

1. Consulte o arquivo `API_DOCS.md` para ver todos os endpoints necessários
2. Substitua as funções mock em `src/lib/mockData.ts` por chamadas reais à API
3. Implemente autenticação JWT ou OAuth
4. Configure variáveis de ambiente para URLs da API

## 📖 Documentação da API

Consulte o arquivo [API_DOCS.md](./API_DOCS.md) para a documentação completa dos endpoints que o backend deve fornecer.

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint

# Typecheck
npm run typecheck
```

## 📝 Notas de Desenvolvimento

- Todos os componentes estão totalmente documentados
- O código segue as melhores práticas do React e TypeScript
- O design system é configurável via `src/index.css` e `tailwind.config.ts`
- Componentes shadcn/ui podem ser customizados conforme necessário

## 📄 Licença

Este projeto foi desenvolvido como sistema de gestão para clubes associativos.

---

**Desenvolvido com ❤️ usando React + TypeScript**
