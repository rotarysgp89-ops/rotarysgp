/**
 * Dashboard para Administradores
 * Exibe visão geral financeira e ações rápidas
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLancamentos } from '@/hooks/useFinanceiro';
import { useMemo } from 'react';

export const DashboardAdmin = () => {
  const { lancamentos, isLoading } = useLancamentos();
  
  /**
   * Calcula totais financeiros
   */
  const resumoFinanceiro = useMemo(() => {
    if (!lancamentos) return { receitas: 0, despesas: 0, saldo: 0 };
    
    const receitas = lancamentos
      .filter(l => l.tipo === 'receita')
      .reduce((sum, l) => sum + Number(l.valor), 0);
    
    const despesas = lancamentos
      .filter(l => l.tipo === 'despesa')
      .reduce((sum, l) => sum + Number(l.valor), 0);
    
    return {
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  }, [lancamentos]);
  
  /**
   * Últimos lançamentos
   */
  const ultimosLancamentos = useMemo(() => {
    if (!lancamentos) return [];
    
    return [...lancamentos]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [lancamentos]);
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">Visão geral do clube e acesso rápido</p>
      </div>
      
      {/* Cards de Resumo Financeiro */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              R$ {resumoFinanceiro.receitas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas do período
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {resumoFinanceiro.despesas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Despesas do período
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resumoFinanceiro.saldo >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              R$ {resumoFinanceiro.saldo.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {resumoFinanceiro.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Ações Rápidas */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Ações Rápidas</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
          <Link to="/associados">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Cadastrar Associado</CardTitle>
                    <CardDescription>Novo cadastro</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/financeiro">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Lançamento Financeiro</CardTitle>
                    <CardDescription>Novo lançamento</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/agenda">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Ver Agenda</CardTitle>
                    <CardDescription>Aluguéis agendados</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
      
      {/* Últimos Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Lançamentos Financeiros</CardTitle>
          <CardDescription>Os 5 lançamentos mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ultimosLancamentos.map((lancamento) => (
              <div key={lancamento.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0 gap-1">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lancamento.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(lancamento.data).toLocaleDateString('pt-BR')} • {(lancamento as any).categoria?.nome || 'Sem categoria'}
                  </p>
                </div>
                <div className={`font-bold text-sm sm:text-base ${lancamento.tipo === 'receita' ? 'text-secondary' : 'text-destructive'}`}>
                  {lancamento.tipo === 'receita' ? '+' : '-'} R$ {Number(lancamento.valor).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <Link to="/financeiro">
            <Button variant="outline" className="w-full mt-4">
              Ver Todos os Lançamentos
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
