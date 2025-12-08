/**
 * Hook para gerenciar associados no banco de dados
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Associado {
  id: string;
  nome_completo: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  contato_telefone: string;
  contato_celular: string;
  contato_email: string;
  status: 'ativo' | 'inativo';
  data_associacao: string;
  observacoes?: string;
}

export interface Familiar {
  id: string;
  associado_id: string;
  nome: string;
  parentesco: 'cônjuge' | 'filho(a)' | 'pai/mãe' | 'irmão/irmã' | 'outro';
  data_nascimento: string;
  cpf?: string | null;
}

export type Parentesco = 'cônjuge' | 'filho(a)' | 'pai/mãe' | 'irmão/irmã' | 'outro';

export const useAssociados = () => {
  const queryClient = useQueryClient();

  // Buscar todos os associados
  const { data: associados, isLoading } = useQuery({
    queryKey: ['associados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('associados')
        .select('*')
        .order('nome_completo');
      
      if (error) throw error;
      return data as Associado[];
    },
  });

  // Criar associado
  const createAssociado = useMutation({
    mutationFn: async (associado: Omit<Associado, 'id'>) => {
      const { data, error } = await supabase
        .from('associados')
        .insert(associado)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados'] });
      toast.success('Associado criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar associado: ${error.message}`);
    },
  });

  // Atualizar associado
  const updateAssociado = useMutation({
    mutationFn: async ({ id, ...associado }: Partial<Associado> & { id: string }) => {
      const { data, error } = await supabase
        .from('associados')
        .update(associado)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados'] });
      toast.success('Associado atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar associado: ${error.message}`);
    },
  });

  // Deletar associado
  const deleteAssociado = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('associados')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados'] });
      toast.success('Associado removido com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover associado: ${error.message}`);
    },
  });

  return {
    associados,
    isLoading,
    createAssociado: createAssociado.mutate,
    updateAssociado: updateAssociado.mutate,
    deleteAssociado: deleteAssociado.mutate,
    isCreating: createAssociado.isPending,
    isUpdating: updateAssociado.isPending,
  };
};

// Hook para gerenciar familiares
export const useFamiliares = (associadoId: string) => {
  const queryClient = useQueryClient();

  const { data: familiares, isLoading } = useQuery({
    queryKey: ['familiares', associadoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('familiares')
        .select('*')
        .eq('associado_id', associadoId);
      
      if (error) throw error;
      return data as Familiar[];
    },
    enabled: !!associadoId,
  });

  const createFamiliar = useMutation({
    mutationFn: async (familiar: Omit<Familiar, 'id'>) => {
      const { data, error } = await supabase
        .from('familiares')
        .insert(familiar)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares', associadoId] });
      toast.success('Familiar adicionado com sucesso');
    },
  });

  const deleteFamiliar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('familiares')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares', associadoId] });
      toast.success('Familiar removido com sucesso');
    },
  });

  return {
    familiares,
    isLoading,
    createFamiliar: createFamiliar.mutate,
    deleteFamiliar: deleteFamiliar.mutate,
  };
};
