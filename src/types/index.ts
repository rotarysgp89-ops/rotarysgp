/**
 * Tipos e interfaces do sistema
 * Este arquivo centraliza todas as definições de tipos para garantir consistência
 */

/**
 * Tipo de usuário do sistema
 */
export type UserRole = 'admin' | 'associado';

/**
 * Status do associado
 */
export type AssociadoStatus = 'ativo' | 'inativo';

/**
 * Tipo de transação financeira
 */
export type TransacaoTipo = 'receita' | 'despesa';

/**
 * Parentesco familiar
 */
export type Parentesco = 'cônjuge' | 'filho(a)' | 'pai/mãe' | 'irmão/irmã' | 'outro';

/**
 * Interface para usuário do sistema
 */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: Date;
}

/**
 * Interface para familiar de um associado
 */
export interface Familiar {
  id: string;
  nome: string;
  parentesco: Parentesco;
  dataNascimento: Date;
  cpf?: string;
}

/**
 * Interface para associado do clube
 */
export interface Associado {
  id: string;
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: Date;
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    celular: string;
    email: string;
  };
  status: AssociadoStatus;
  familiares: Familiar[];
  dataAssociacao: Date;
  observacoes?: string;
}

/**
 * Interface para categoria do plano de contas
 */
export interface ContaCategoria {
  id: string;
  nome: string;
  tipo: TransacaoTipo;
  descricao?: string;
}

/**
 * Interface para lançamento financeiro
 */
export interface LancamentoFinanceiro {
  id: string;
  data: Date;
  descricao: string;
  valor: number;
  tipo: TransacaoTipo;
  categoriaId: string;
  categoria?: ContaCategoria;
  observacoes?: string;
}

/**
 * Interface para agendamento de aluguel
 */
export interface AgendamentoAluguel {
  id: string;
  data: Date;
  nomeResponsavel: string;
  contato: string;
  observacoes?: string;
  valorCobrado?: number;
}
