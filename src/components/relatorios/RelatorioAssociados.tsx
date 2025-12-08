/**
 * Componente para Relatório de Associados
 * Filtra e exibe lista de associados com familiares
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssociados } from '@/hooks/useAssociados';
import { FileText, Users, Calendar } from 'lucide-react';

export const RelatorioAssociados = () => {
  const [statusFiltro, setStatusFiltro] = useState<'ativo' | 'inativo' | 'todos'>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const { associados, isLoading } = useAssociados();
  
  /**
   * Filtra associados por status e data de associação
   */
  const associadosFiltrados = useMemo(() => {
    if (!associados) return [];
    
    return associados.filter(a => {
      // Filtro por status
      if (statusFiltro !== 'todos' && a.status !== statusFiltro) return false;
      
      // Filtro por data de nascimento (aniversário)
      if (dataInicio && a.data_nascimento) {
        if (new Date(a.data_nascimento) < new Date(dataInicio)) return false;
      }
      if (dataFim && a.data_nascimento) {
        if (new Date(a.data_nascimento) > new Date(dataFim)) return false;
      }
      
      return true;
    });
  }, [associados, statusFiltro, dataInicio, dataFim]);
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  /**
   * Imprime o relatório
   */
  const handleImprimir = () => {
    window.print();
  };

  /**
   * Limpa todos os filtros
   */
  const handleLimparFiltros = () => {
    setStatusFiltro('todos');
    setDataInicio('');
    setDataFim('');
  };
  
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
          <CardDescription>Filtre por status e data de aniversário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFiltro} onValueChange={(v: any) => setStatusFiltro(v)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Aniversário (De)</Label>
              <Input 
                id="dataInicio" 
                type="date" 
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataFim">Aniversário (Até)</Label>
              <Input 
                id="dataFim" 
                type="date" 
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)} 
              />
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={handleLimparFiltros} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Associados
            </CardTitle>
            <CardDescription>{associadosFiltrados.length} associado(s) encontrado(s)</CardDescription>
          </div>
          <Button onClick={handleImprimir} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {associadosFiltrados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum associado encontrado com os filtros selecionados.</p>
            ) : (
              associadosFiltrados.map(associado => (
                <div key={associado.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{associado.nome_completo}</h3>
                      <p className="text-sm text-muted-foreground">CPF: {associado.cpf} • RG: {associado.rg}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      associado.status === 'ativo' 
                        ? 'bg-secondary/10 text-secondary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {associado.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="grid gap-2 text-sm mb-3">
                    <p><strong>Data de Nascimento:</strong> {new Date(associado.data_nascimento).toLocaleDateString('pt-BR')}</p>
                    {associado.data_associacao && (
                      <p><strong>Data de Associação:</strong> {new Date(associado.data_associacao).toLocaleDateString('pt-BR')}</p>
                    )}
                    <p>
                      <strong>Endereço:</strong> {associado.endereco_rua}, {associado.endereco_numero}
                      {associado.endereco_complemento && ` - ${associado.endereco_complemento}`}, 
                      {associado.endereco_bairro} - {associado.endereco_cidade}/{associado.endereco_estado}
                    </p>
                    <p><strong>Contato:</strong> {associado.contato_celular} • {associado.contato_email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
