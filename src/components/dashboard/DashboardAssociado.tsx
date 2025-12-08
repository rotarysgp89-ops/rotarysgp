/**
 * Dashboard para Associados
 * Exibe informações básicas e agenda
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAgendamentos } from '@/hooks/useAgendamentos';

export const DashboardAssociado = () => {
  const { user } = useAuth();
  const { agendamentos, isLoading } = useAgendamentos();
  
  /**
   * Próximos agendamentos
   */
  const proximosAgendamentos = agendamentos
    ?.filter(a => new Date(a.data) >= new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3) || [];
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Header com boas-vindas */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bem-vindo(a)!</h1>
        <p className="text-muted-foreground mt-2">Aqui você pode acompanhar a agenda do clube</p>
      </div>
      
      {/* Card de Informações do Associado */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Seus Dados</CardTitle>
              <CardDescription>Visualize e atualize suas informações</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Tipo de Conta:</strong> Associado</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Próximos Agendamentos do Clube</CardTitle>
              <CardDescription>Confira os dias já reservados</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {proximosAgendamentos.length > 0 ? (
            <div className="space-y-4">
              {proximosAgendamentos.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{new Date(agendamento.data).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}</p>
                    <p className="text-sm text-muted-foreground">{agendamento.nome_responsavel}</p>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    Reservado
                  </div>
                </div>
              ))}
              
              <Link to="/agenda">
                <Button variant="outline" className="w-full mt-2">
                  Ver Agenda Completa
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum agendamento futuro no momento</p>
              <Link to="/agenda">
                <Button variant="outline" className="mt-4">
                  Ver Agenda
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
