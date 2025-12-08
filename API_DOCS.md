# Documentação da API - Sistema de Gestão de Clubes

Esta documentação descreve todos os endpoints que o backend deve implementar para que o frontend funcione completamente.

## 🔐 Autenticação

Todos os endpoints (exceto login) devem requerer autenticação via token JWT no header:
```
Authorization: Bearer {token}
```

---

## 📍 Endpoints de Autenticação

### POST /api/auth/login
Autentica um usuário e retorna um token JWT.

**Request Body:**
```json
{
  "email": "admin@clube.com",
  "senha": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "1",
    "nome": "Administrador do Sistema",
    "email": "admin@clube.com",
    "role": "admin",
    "ativo": true
  }
}
```

**Response (401):**
```json
{
  "erro": "Credenciais inválidas"
}
```

---

### POST /api/auth/logout
Invalida o token do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "mensagem": "Logout realizado com sucesso"
}
```

---

### GET /api/auth/me
Retorna os dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "1",
  "nome": "Administrador do Sistema",
  "email": "admin@clube.com",
  "role": "admin",
  "ativo": true,
  "criadoEm": "2024-01-01T00:00:00.000Z"
}
```

---

## 👥 Endpoints de Associados

### GET /api/associados
Lista todos os associados (apenas admin).

**Query Parameters:**
- `busca` (opcional): Busca por nome ou CPF
- `status` (opcional): "ativo" | "inativo" | "todos"

**Response (200):**
```json
[
  {
    "id": "1",
    "nomeCompleto": "João da Silva",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "dataNascimento": "1985-05-15",
    "endereco": {
      "rua": "Rua das Flores",
      "numero": "123",
      "complemento": "Apto 45",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567"
    },
    "contato": {
      "telefone": "(11) 3456-7890",
      "celular": "(11) 98765-4321",
      "email": "joao@email.com"
    },
    "status": "ativo",
    "familiares": [
      {
        "id": "f1",
        "nome": "Maria da Silva",
        "parentesco": "cônjuge",
        "dataNascimento": "1987-08-20",
        "cpf": "987.654.321-00"
      }
    ],
    "dataAssociacao": "2020-01-15",
    "observacoes": "Associado desde 2020"
  }
]
```

---

### GET /api/associados/:id
Retorna os detalhes de um associado específico.

**Response (200):**
```json
{
  "id": "1",
  "nomeCompleto": "João da Silva",
  "cpf": "123.456.789-00",
  // ... todos os campos do associado
}
```

---

### POST /api/associados
Cria um novo associado (apenas admin).

**Request Body:**
```json
{
  "nomeCompleto": "Ana Paula Santos",
  "cpf": "321.654.987-00",
  "rg": "98.765.432-1",
  "dataNascimento": "1990-12-03",
  "endereco": {
    "rua": "Avenida Principal",
    "numero": "456",
    "complemento": "",
    "bairro": "Jardim América",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01987-654"
  },
  "contato": {
    "telefone": "(11) 2345-6789",
    "celular": "(11) 97654-3210",
    "email": "ana@email.com"
  },
  "status": "ativo",
  "familiares": [],
  "observacoes": ""
}
```

**Response (201):**
```json
{
  "id": "2",
  "nomeCompleto": "Ana Paula Santos",
  // ... todos os campos criados
}
```

---

### PUT /api/associados/:id
Atualiza um associado existente (apenas admin).

**Request Body:** Mesmo formato do POST

**Response (200):**
```json
{
  "id": "1",
  // ... campos atualizados
}
```

---

### DELETE /api/associados/:id
Remove um associado (apenas admin).

**Response (200):**
```json
{
  "mensagem": "Associado removido com sucesso"
}
```

---

## 💰 Endpoints Financeiros

### GET /api/categorias
Lista todas as categorias do plano de contas.

**Query Parameters:**
- `tipo` (opcional): "receita" | "despesa" | "todos"

**Response (200):**
```json
[
  {
    "id": "c1",
    "nome": "Mensalidades",
    "tipo": "receita",
    "descricao": "Mensalidades dos associados"
  },
  {
    "id": "c4",
    "nome": "Água e Luz",
    "tipo": "despesa",
    "descricao": "Contas de utilidades"
  }
]
```

---

### POST /api/categorias
Cria uma nova categoria (apenas admin).

**Request Body:**
```json
{
  "nome": "Taxa de Manutenção",
  "tipo": "receita",
  "descricao": "Taxa anual de manutenção"
}
```

**Response (201):**
```json
{
  "id": "c8",
  "nome": "Taxa de Manutenção",
  "tipo": "receita",
  "descricao": "Taxa anual de manutenção"
}
```

---

### GET /api/lancamentos
Lista todos os lançamentos financeiros.

**Query Parameters:**
- `tipo` (opcional): "receita" | "despesa" | "todos"
- `dataInicio` (opcional): Data no formato YYYY-MM-DD
- `dataFim` (opcional): Data no formato YYYY-MM-DD
- `categoriaId` (opcional): ID da categoria

**Response (200):**
```json
[
  {
    "id": "l1",
    "data": "2025-01-05",
    "descricao": "Mensalidade Janeiro - João Silva",
    "valor": 150.00,
    "tipo": "receita",
    "categoriaId": "c1",
    "categoria": {
      "id": "c1",
      "nome": "Mensalidades",
      "tipo": "receita"
    },
    "observacoes": ""
  }
]
```

---

### POST /api/lancamentos
Cria um novo lançamento financeiro (apenas admin).

**Request Body:**
```json
{
  "data": "2025-01-20",
  "descricao": "Conta de Água",
  "valor": 250.00,
  "tipo": "despesa",
  "categoriaId": "c4",
  "observacoes": "Referente ao mês de janeiro"
}
```

**Response (201):**
```json
{
  "id": "l6",
  "data": "2025-01-20",
  "descricao": "Conta de Água",
  "valor": 250.00,
  "tipo": "despesa",
  "categoriaId": "c4",
  "observacoes": "Referente ao mês de janeiro"
}
```

---

### GET /api/financeiro/resumo
Retorna resumo financeiro com totais.

**Query Parameters:**
- `dataInicio` (opcional): Data no formato YYYY-MM-DD
- `dataFim` (opcional): Data no formato YYYY-MM-DD

**Response (200):**
```json
{
  "receitas": 1100.00,
  "despesas": 750.00,
  "saldo": 350.00,
  "periodo": {
    "inicio": "2025-01-01",
    "fim": "2025-01-31"
  }
}
```

---

## 📅 Endpoints de Agenda

### GET /api/agendamentos
Lista todos os agendamentos.

**Query Parameters:**
- `mes` (opcional): Número do mês (1-12)
- `ano` (opcional): Ano (ex: 2025)

**Response (200):**
```json
[
  {
    "id": "a1",
    "data": "2025-01-25",
    "nomeResponsavel": "Carlos Oliveira",
    "contato": "(11) 99999-8888",
    "observacoes": "Festa de aniversário - 50 pessoas",
    "valorCobrado": 800.00
  }
]
```

---

### POST /api/agendamentos
Cria um novo agendamento (apenas admin).

**Request Body:**
```json
{
  "data": "2025-02-15",
  "nomeResponsavel": "Maria Santos",
  "contato": "(11) 98888-7777",
  "observacoes": "Confraternização",
  "valorCobrado": 600.00
}
```

**Response (201):**
```json
{
  "id": "a3",
  "data": "2025-02-15",
  "nomeResponsavel": "Maria Santos",
  "contato": "(11) 98888-7777",
  "observacoes": "Confraternização",
  "valorCobrado": 600.00
}
```

---

### DELETE /api/agendamentos/:id
Cancela um agendamento (apenas admin).

**Response (200):**
```json
{
  "mensagem": "Agendamento cancelado com sucesso"
}
```

---

## 📊 Endpoints de Relatórios

### GET /api/relatorios/financeiro
Gera relatório financeiro detalhado.

**Query Parameters:**
- `dataInicio`: Data no formato YYYY-MM-DD (obrigatório)
- `dataFim`: Data no formato YYYY-MM-DD (obrigatório)
- `tipo` (opcional): "receita" | "despesa" | "todos"

**Response (200):**
```json
{
  "periodo": {
    "inicio": "2025-01-01",
    "fim": "2025-01-31"
  },
  "resumo": {
    "receitas": 1100.00,
    "despesas": 750.00,
    "saldo": 350.00
  },
  "lancamentos": [
    {
      "id": "l1",
      "data": "2025-01-05",
      "descricao": "Mensalidade Janeiro",
      "valor": 150.00,
      "tipo": "receita",
      "categoria": "Mensalidades"
    }
  ]
}
```

---

### GET /api/relatorios/associados
Gera relatório de associados.

**Query Parameters:**
- `status` (opcional): "ativo" | "inativo" | "todos"

**Response (200):**
```json
{
  "total": 2,
  "ativos": 2,
  "inativos": 0,
  "associados": [
    {
      "id": "1",
      "nomeCompleto": "João da Silva",
      "cpf": "123.456.789-00",
      "status": "ativo",
      "endereco": "Rua das Flores, 123 - Centro",
      "contato": "(11) 98765-4321",
      "familiares": [
        {
          "nome": "Maria da Silva",
          "parentesco": "cônjuge"
        }
      ]
    }
  ]
}
```

---

## ⚙️ Endpoints de Configurações

### GET /api/usuarios
Lista todos os usuários do sistema (apenas admin).

**Response (200):**
```json
[
  {
    "id": "1",
    "nome": "Administrador do Sistema",
    "email": "admin@clube.com",
    "role": "admin",
    "ativo": true,
    "criadoEm": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### POST /api/usuarios
Cria um novo usuário do sistema (apenas admin).

**Request Body:**
```json
{
  "nome": "Novo Usuário",
  "email": "novo@clube.com",
  "senha": "senha123",
  "role": "associado"
}
```

**Response (201):**
```json
{
  "id": "3",
  "nome": "Novo Usuário",
  "email": "novo@clube.com",
  "role": "associado",
  "ativo": true,
  "criadoEm": "2025-01-15T10:30:00.000Z"
}
```

---

### PUT /api/usuarios/:id
Atualiza um usuário existente (apenas admin).

**Request Body:**
```json
{
  "nome": "Usuário Atualizado",
  "email": "atualizado@clube.com",
  "role": "admin",
  "ativo": false
}
```

**Response (200):**
```json
{
  "id": "3",
  "nome": "Usuário Atualizado",
  "email": "atualizado@clube.com",
  "role": "admin",
  "ativo": false
}
```

---

## 🔒 Códigos de Status HTTP

- `200` - OK (sucesso)
- `201` - Created (recurso criado)
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro do servidor)

---

## 📝 Notas de Implementação

1. **Autenticação:** Todos os endpoints (exceto `/api/auth/login`) devem validar o token JWT
2. **Autorização:** Endpoints marcados como "apenas admin" devem verificar `role === 'admin'`
3. **Validação:** Todos os dados recebidos devem ser validados antes de processar
4. **Datas:** Todas as datas devem estar no formato ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)
5. **Paginação:** Considere implementar paginação para endpoints que retornam muitos registros
6. **CORS:** Configure CORS apropriadamente para permitir requisições do frontend

---

## 🛡️ Segurança

- Use HTTPS em produção
- Implemente rate limiting
- Hash de senhas com bcrypt ou similar
- Tokens JWT com expiração apropriada
- Validação rigorosa de todos os inputs
- Sanitização de dados antes de armazenar no banco

---

**Última atualização:** 2025-01-10
