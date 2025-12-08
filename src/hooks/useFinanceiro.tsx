/**
 * Hook para gerenciar dados financeiros
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  descricao?: string;
}

export interface Lancamento {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria_id: string;
  observacoes?: string;
}

export const useCategorias = () => {
  const queryClient = useQueryClient();

  const { data: categorias, isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_contas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Categoria[];
    },
  });

  const createCategoria = useMutation({
    mutationFn: async (categoria: Omit<Categoria, 'id'>) => {
      const { data, error } = await supabase
        .from('categorias_contas')
        .insert(categoria)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoria criada com sucesso');
    },
  });

  return {
    categorias,
    isLoading,
    createCategoria: createCategoria.mutate,
  };
};

export const useLancamentos = () => {
  const queryClient = useQueryClient();

  const { data: lancamentos, isLoading } = useQuery({
    queryKey: ['lancamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lancamentos_financeiros')
        .select(`
          *,
          categoria:categorias_contas(*)
        `)
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createLancamento = useMutation({
    mutationFn: async (lancamento: Omit<Lancamento, 'id'>) => {
      const { data, error } = await supabase
        .from('lancamentos_financeiros')
        .insert(lancamento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      toast.success('Lançamento criado com sucesso');
    },
  });

  return {
    lancamentos,
    isLoading,
    createLancamento: createLancamento.mutate,
  };
};
