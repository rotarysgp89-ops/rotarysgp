/**
 * Componente para gestão de Lançamentos Financeiros
 * Lista e permite criar lançamentos de receitas e despesas
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter } from 'lucide-react';
import { useLancamentos, useCategorias } from '@/hooks/useFinanceiro';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const Lancamentos = () => {
  const { lancamentos, createLancamento, isLoading } = useLancamentos();
  const { categorias } = useCategorias();
  const [filtroTipo, setFiltroTipo] = useState<'receita' | 'despesa' | 'todos'>('todos');
  const [dialogAberto, setDialogAberto] = useState(false);
  
  // Form state
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [categoriaId, setCategoriaId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  /**
   * Filtra lançamentos por tipo
   */
  const lancamentosFiltrados = useMemo(() => {
    if (!lancamentos) return [];
    if (filtroTipo === 'todos') return lancamentos;
    return lancamentos.filter(l => l.tipo === filtroTipo);
  }, [lancamentos, filtroTipo]);
  
  /**
   * Calcula totais
   */
  const totais = useMemo(() => {
    const receitas = lancamentosFiltrados
      .filter(l => l.tipo === 'receita')
      .reduce((sum, l) => sum + Number(l.valor), 0);
    
    const despesas = lancamentosFiltrados
      .filter(l => l.tipo === 'despesa')
      .reduce((sum, l) => sum + Number(l.valor), 0);
    
    return { receitas, despesas, saldo: receitas - despesas };
  }, [lancamentosFiltrados]);
  
  /**
   * Cria novo lançamento
   */
  const handleCriarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    createLancamento({
      data,
      descricao,
      valor: parseFloat(valor),
      tipo,
      categoria_id: categoriaId,
      observacoes
    });
    setDialogAberto(false);
    // Reset form
    setDescricao('');
    setValor('');
    setObservacoes('');
  };
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lançamentos Financeiros</h2>
          <p className="text-sm text-muted-foreground">Registre receitas e despesas</p>
        </div>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Lançamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCriarLancamento} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={tipo} onValueChange={(v: 'receita' | 'despesa') => setTipo(v)}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias?.filter(cat => cat.tipo === tipo).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input id="valor" type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>Cancelar</Button>
                <Button type="submit">Criar Lançamento</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filtros e Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-secondary">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-secondary">R$ {totais.receitas.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">R$ {totais.despesas.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              R$ {totais.saldo.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Lançamentos</CardTitle>
          <CardDescription>{lancamentosFiltrados.length} lançamento(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lancamentosFiltrados.map((lancamento) => {
              return (
                <div 
                  key={lancamento.id} 
                  className="flex items-center justify-between border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{lancamento.descricao}</h4>
                      <Badge variant={lancamento.tipo === 'receita' ? 'default' : 'destructive'}>
                        {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(lancamento.data).toLocaleDateString('pt-BR')} • {lancamento.categoria?.nome}
                    </p>
                  </div>
                  
                  <div className={`text-lg font-bold ${lancamento.tipo === 'receita' ? 'text-secondary' : 'text-destructive'}`}>
                    {lancamento.tipo === 'receita' ? '+' : '-'} R$ {Number(lancamento.valor).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
