/**
 * Componente para Relatório Financeiro
 * Filtra e exibe lançamentos por período
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLancamentos, useCategorias } from '@/hooks/useFinanceiro';
import { FileText } from 'lucide-react';

export const RelatorioFinanceiro = () => {
  const [dataInicio, setDataInicio] = useState('2025-01-01');
  const [dataFim, setDataFim] = useState('2025-12-31');
  const [tipoFiltro, setTipoFiltro] = useState<'receita' | 'despesa' | 'todos'>('todos');
  
  const { lancamentos, isLoading } = useLancamentos();
  const { categorias } = useCategorias();
  
  /**
   * Filtra lançamentos por período e tipo
   */
  const dadosRelatorio = useMemo(() => {
    if (!lancamentos) return { lancamentos: [], receitas: 0, despesas: 0, saldo: 0 };
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    const lancamentosFiltrados = lancamentos.filter(l => {
      const dataLancamento = new Date(l.data);
      const dentroPerido = dataLancamento >= inicio && dataLancamento <= fim;
      const tipoMatch = tipoFiltro === 'todos' || l.tipo === tipoFiltro;
      return dentroPerido && tipoMatch;
    });
    
    const receitas = lancamentosFiltrados
      .filter(l => l.tipo === 'receita')
      .reduce((sum, l) => sum + Number(l.valor), 0);
    
    const despesas = lancamentosFiltrados
      .filter(l => l.tipo === 'despesa')
      .reduce((sum, l) => sum + Number(l.valor), 0);
    
    return {
      lancamentos: lancamentosFiltrados,
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  }, [lancamentos, dataInicio, dataFim, tipoFiltro]);
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  /**
   * Imprime o relatório
   */
  const handleImprimir = () => {
    window.print();
  };
  
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Relatório</CardTitle>
          <CardDescription>Selecione o período e tipo de transação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input 
                id="dataInicio" 
                type="date" 
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <Input 
                id="dataFim" 
                type="date" 
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoFiltro} onValueChange={(v: any) => setTipoFiltro(v)}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-secondary">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-secondary">R$ {dadosRelatorio.receitas.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">R$ {dadosRelatorio.despesas.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${dadosRelatorio.saldo >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              R$ {dadosRelatorio.saldo.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Lançamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lançamentos do Período</CardTitle>
              <CardDescription>{dadosRelatorio.lancamentos.length} lançamento(s) encontrado(s)</CardDescription>
            </div>
            <Button onClick={handleImprimir} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium">Data</th>
                  <th className="text-left p-2 font-medium">Descrição</th>
                  <th className="text-left p-2 font-medium">Categoria</th>
                  <th className="text-left p-2 font-medium">Tipo</th>
                  <th className="text-right p-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dadosRelatorio.lancamentos.map(l => {
                  return (
                    <tr key={l.id} className="border-b border-border/50 last:border-0">
                      <td className="p-2 text-sm">{new Date(l.data).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2 text-sm">{l.descricao}</td>
                      <td className="p-2 text-sm">{l.categoria?.nome}</td>
                      <td className="p-2 text-sm">
                        <span className={l.tipo === 'receita' ? 'text-secondary' : 'text-destructive'}>
                          {l.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className={`p-2 text-sm text-right font-medium ${l.tipo === 'receita' ? 'text-secondary' : 'text-destructive'}`}>
                        {l.tipo === 'receita' ? '+' : '-'} R$ {Number(l.valor).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
