/**
 * Página de Agenda de Aluguel
 * Exibe calendário com disponibilidade e agendamentos
 * Administradores podem criar novos agendamentos
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useAgendamentos, Agendamento } from '@/hooks/useAgendamentos';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Agenda() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const { agendamentos, createAgendamento, updateAgendamento, deleteAgendamento, isLoading } = useAgendamentos();
  
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null);
  
  // Form state
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [contato, setContato] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [valorCobrado, setValorCobrado] = useState('');
  
  /**
   * Navega entre meses
   */
  const mudarMes = (direcao: number) => {
    const novaData = new Date(mesAtual);
    novaData.setMonth(novaData.getMonth() + direcao);
    setMesAtual(novaData);
  };
  
  /**
   * Gera dias do calendário
   */
  const diasCalendario = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    const diasAntes = primeiroDia.getDay();
    const diasMes = ultimoDia.getDate();
    
    const dias: (Date | null)[] = [];
    
    // Dias vazios antes do início do mês
    for (let i = 0; i < diasAntes; i++) {
      dias.push(null);
    }
    
    // Dias do mês
    for (let i = 1; i <= diasMes; i++) {
      dias.push(new Date(ano, mes, i));
    }
    
    return dias;
  }, [mesAtual]);
  
  // Estatísticas
  const totalAgendamentos = agendamentos?.length || 0;
  const valorTotalCobrado = agendamentos?.reduce((sum, ag) => sum + (Number(ag.valor_cobrado) || 0), 0) || 0;
  const agendamentosHoje = agendamentos?.filter(
    ag => new Date(ag.data).toDateString() === new Date().toDateString()
  ).length || 0;
  
  // Próximo agendamento
  const proximoAgendamento = agendamentos
    ?.filter(ag => new Date(ag.data) >= new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
  
  /**
   * Verifica se um dia está ocupado
   */
  const isDiaOcupado = (data: Date) => {
    return agendamentos?.some(a => 
      new Date(a.data).toDateString() === data.toDateString()
    ) || false;
  };
  
  /**
   * Busca agendamento de um dia
   */
  const getAgendamento = (data: Date) => {
    return agendamentos?.find(a => 
      new Date(a.data).toDateString() === data.toDateString()
    );
  };
  
  /**
   * Inicia edição de agendamento
   */
  const handleEditarAgendamento = (agendamento: Agendamento) => {
    setAgendamentoEditando(agendamento);
    setNomeResponsavel(agendamento.nome_responsavel);
    setContato(agendamento.contato);
    setObservacoes(agendamento.observacoes || '');
    setValorCobrado(agendamento.valor_cobrado?.toString() || '');
    setModoEdicao(true);
  };

  /**
   * Reseta o formulário
   */
  const resetForm = () => {
    setNomeResponsavel('');
    setContato('');
    setObservacoes('');
    setValorCobrado('');
    setModoEdicao(false);
    setAgendamentoEditando(null);
  };

  /**
   * Cria ou atualiza agendamento
   */
  const handleSubmitAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modoEdicao && agendamentoEditando) {
      updateAgendamento({
        id: agendamentoEditando.id,
        nome_responsavel: nomeResponsavel,
        contato,
        observacoes,
        valor_cobrado: valorCobrado ? parseFloat(valorCobrado) : undefined
      });
    } else if (diaSelecionado) {
      createAgendamento({
        data: diaSelecionado.toISOString().split('T')[0],
        nome_responsavel: nomeResponsavel,
        contato,
        observacoes,
        valor_cobrado: valorCobrado ? parseFloat(valorCobrado) : undefined
      });
    }
    
    setDialogAberto(false);
    resetForm();
  };
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Agenda de Aluguel</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {isAdmin 
            ? 'Gerencie os agendamentos do clube' 
            : 'Visualize a disponibilidade do clube'}
        </p>
      </div>
      
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => mudarMes(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => mudarMes(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, i) => (
                <div key={i} className="text-center text-xs md:text-sm font-medium text-muted-foreground p-1 md:p-2">
                  <span className="hidden sm:inline">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}</span>
                  <span className="sm:hidden">{dia}</span>
                </div>
              ))}
            </div>
            
            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {diasCalendario.map((dia, index) => {
                if (!dia) {
                  return <div key={index} className="aspect-square" />;
                }
                
                const ocupado = isDiaOcupado(dia);
                const agendamento = getAgendamento(dia);
                const hoje = dia.toDateString() === new Date().toDateString();
                
                return (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <button
                        className={`
                          aspect-square p-1 md:p-2 rounded-lg text-xs md:text-sm transition-colors
                          ${hoje ? 'ring-2 ring-primary' : ''}
                          ${ocupado 
                            ? 'bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20' 
                            : 'bg-secondary/10 text-secondary hover:bg-secondary/20'}
                        `}
                        onClick={() => setDiaSelecionado(dia)}
                      >
                        <div className="text-center">
                          {dia.getDate()}
                        </div>
                        {ocupado && (
                          <div className="mt-0.5 md:mt-1 text-[10px] md:text-xs hidden sm:block">Ocupado</div>
                        )}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:w-full max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {dia.toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          })}
                        </DialogTitle>
                      </DialogHeader>
                      
                      {agendamento ? (
                        modoEdicao && agendamentoEditando?.id === agendamento.id ? (
                          <form onSubmit={handleSubmitAgendamento} className="space-y-4">
                            <Badge variant="secondary">Editando Agendamento</Badge>
                            
                            <div className="space-y-2">
                              <Label htmlFor="responsavel">Nome do Responsável *</Label>
                              <Input 
                                id="responsavel" 
                                value={nomeResponsavel}
                                onChange={(e) => setNomeResponsavel(e.target.value)}
                                required 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="contato">Contato *</Label>
                              <Input 
                                id="contato" 
                                placeholder="(00) 00000-0000"
                                value={contato}
                                onChange={(e) => setContato(e.target.value)}
                                required 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="valor">Valor Cobrado (R$)</Label>
                              <Input 
                                id="valor" 
                                type="number" 
                                step="0.01" 
                                min="0"
                                value={valorCobrado}
                                onChange={(e) => setValorCobrado(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="obs">Observações</Label>
                              <Textarea 
                                id="obs"
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                              />
                            </div>
                            
                            <div className="flex gap-3 justify-end">
                              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                              <Button type="submit">Salvar</Button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-4">
                            <Badge variant="destructive">Dia Ocupado</Badge>
                            <div className="space-y-2 text-sm">
                              <p><strong>Responsável:</strong> {agendamento.nome_responsavel}</p>
                              <p><strong>Contato:</strong> {agendamento.contato}</p>
                              {agendamento.observacoes && (
                                <p><strong>Observações:</strong> {agendamento.observacoes}</p>
                              )}
                              {agendamento.valor_cobrado && (
                                <p><strong>Valor:</strong> R$ {Number(agendamento.valor_cobrado).toFixed(2)}</p>
                              )}
                            </div>
                            
                            {isAdmin && (
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditarAgendamento(agendamento)}
                                  className="flex-1"
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="flex-1">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteAgendamento(agendamento.id)}>
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        )
                      ) : isAdmin ? (
                        <form onSubmit={handleSubmitAgendamento} className="space-y-4">
                          <Badge>Dia Disponível</Badge>
                          
                          <div className="space-y-2">
                            <Label htmlFor="responsavel">Nome do Responsável *</Label>
                            <Input 
                              id="responsavel" 
                              value={nomeResponsavel}
                              onChange={(e) => setNomeResponsavel(e.target.value)}
                              required 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="contato">Contato *</Label>
                            <Input 
                              id="contato" 
                              placeholder="(00) 00000-0000"
                              value={contato}
                              onChange={(e) => setContato(e.target.value)}
                              required 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="valor">Valor Cobrado (R$)</Label>
                            <Input 
                              id="valor" 
                              type="number" 
                              step="0.01" 
                              min="0"
                              value={valorCobrado}
                              onChange={(e) => setValorCobrado(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="obs">Observações</Label>
                            <Textarea 
                              id="obs"
                              value={observacoes}
                              onChange={(e) => setObservacoes(e.target.value)}
                            />
                          </div>
                          
                          <div className="flex gap-3 justify-end">
                            <Button type="button" variant="outline">Cancelar</Button>
                            <Button type="submit">Agendar</Button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-6">
                          <Badge>Dia Disponível</Badge>
                          <p className="text-sm text-muted-foreground mt-4">
                            Entre em contato com a administração para agendar
                          </p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
            
            {/* Legenda */}
            <div className="mt-6 flex gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary/10" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/10" />
                <span>Ocupado</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Agendamentos confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agendamentos
                ?.filter(a => new Date(a.data) >= new Date())
                .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                .slice(0, 5)
                .map(agendamento => (
                  <div key={agendamento.id} className="border border-border rounded-lg p-3 bg-accent/50">
                    <p className="font-medium text-sm">
                      {new Date(agendamento.data).toLocaleDateString('pt-BR', { 
                        day: 'numeric', 
                        month: 'short'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{agendamento.nome_responsavel}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
