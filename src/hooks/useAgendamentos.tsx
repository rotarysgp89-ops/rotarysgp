/**
 * Hook para gerenciar agendamentos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Agendamento {
  id: string;
  data: string;
  nome_responsavel: string;
  contato: string;
  observacoes?: string;
  valor_cobrado?: number;
}

export const useAgendamentos = () => {
  const queryClient = useQueryClient();

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data');
      
      if (error) throw error;
      return data as Agendamento[];
    },
  });

  const createAgendamento = useMutation({
    mutationFn: async (agendamento: Omit<Agendamento, 'id'>) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert(agendamento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast.success('Agendamento criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });

  const updateAgendamento = useMutation({
    mutationFn: async ({ id, ...agendamento }: Partial<Agendamento> & { id: string }) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(agendamento)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast.success('Agendamento atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
    },
  });

  const deleteAgendamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast.success('Agendamento cancelado com sucesso');
    },
  });

  return {
    agendamentos,
    isLoading,
    createAgendamento: createAgendamento.mutate,
    updateAgendamento: updateAgendamento.mutate,
    deleteAgendamento: deleteAgendamento.mutate,
  };
};
