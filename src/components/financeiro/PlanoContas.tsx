/**
 * Componente para gestão do Plano de Contas
 * Lista e permite criar categorias de receitas e despesas
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useCategorias } from '@/hooks/useFinanceiro';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const PlanoContas = () => {
  const { categorias, createCategoria, isLoading } = useCategorias();
  const [dialogAberto, setDialogAberto] = useState(false);
  
  // Form state
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [descricao, setDescricao] = useState('');
  
  const receitas = categorias?.filter(c => c.tipo === 'receita') || [];
  const despesas = categorias?.filter(c => c.tipo === 'despesa') || [];
  
  /**
   * Cria nova categoria
   */
  const handleCriarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoria({ nome, tipo, descricao });
    setDialogAberto(false);
    setNome('');
    setDescricao('');
  };
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plano de Contas</h2>
          <p className="text-sm text-muted-foreground">Categorias de receitas e despesas</p>
        </div>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCriarCategoria} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Categoria *</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
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
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>Cancelar</Button>
                <Button type="submit">Criar Categoria</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Receitas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <TrendingUp className="h-5 w-5" />
              Receitas
            </CardTitle>
            <CardDescription>{receitas.length} categoria(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receitas.map((categoria) => (
                <div key={categoria.id} className="border border-border rounded-lg p-3 bg-secondary/5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{categoria.nome}</h4>
                    <Badge variant="outline" className="text-secondary border-secondary">
                      Receita
                    </Badge>
                  </div>
                  {categoria.descricao && (
                    <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <TrendingDown className="h-5 w-5" />
              Despesas
            </CardTitle>
            <CardDescription>{despesas.length} categoria(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {despesas.map((categoria) => (
                <div key={categoria.id} className="border border-border rounded-lg p-3 bg-destructive/5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{categoria.nome}</h4>
                    <Badge variant="outline" className="text-destructive border-destructive">
                      Despesa
                    </Badge>
                  </div>
                  {categoria.descricao && (
                    <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
