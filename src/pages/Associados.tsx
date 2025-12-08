/**
 * Página de Gestão de Associados
 * Lista todos os associados e permite cadastro/edição/exclusão
 * Apenas para administradores
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useAssociados, Associado as AssociadoType } from '@/hooks/useAssociados';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AssociadoDetalhes } from '@/components/associados/AssociadoDetalhes';

export default function Associados() {
  const [busca, setBusca] = useState('');
  const { associados, isLoading, deleteAssociado } = useAssociados();
  const [associadoSelecionado, setAssociadoSelecionado] = useState<AssociadoType | null>(null);
  const [dialogCriarAberto, setDialogCriarAberto] = useState(false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  
  /**
   * Filtra associados pela busca
   */
  const associadosFiltrados = associados?.filter(a => 
    a.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    a.cpf.includes(busca)
  ) || [];
  
  const abrirEditar = (associado: AssociadoType) => {
    setAssociadoSelecionado(associado);
    setDialogEditarAberto(true);
  };
  
  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Associados</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gerencie os associados do clube</p>
        </div>
        
        <Dialog open={dialogCriarAberto} onOpenChange={setDialogCriarAberto}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Associado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Associado</DialogTitle>
              <DialogDescription>Preencha os dados para cadastrar um novo associado.</DialogDescription>
            </DialogHeader>
            <AssociadoDetalhes 
              modo="criar" 
              onSuccess={() => setDialogCriarAberto(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de Associados */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Lista de Associados</CardTitle>
          <CardDescription>
            {associadosFiltrados.length} associado(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {associadosFiltrados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum associado encontrado
              </p>
            ) : (
              associadosFiltrados.map((associado) => (
                <div 
                  key={associado.id} 
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold truncate">{associado.nome_completo}</h3>
                      <Badge variant={associado.status === 'ativo' ? 'default' : 'secondary'}>
                        {associado.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                      CPF: {associado.cpf}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {associado.contato_email}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 self-end sm:self-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => abrirEditar(associado)}
                    >
                      <Pencil className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[95vw] sm:w-full">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir associado?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O associado <strong>{associado.nome_completo}</strong> e todos os seus familiares serão removidos permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                          <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteAssociado(associado.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog Editar Associado */}
      <Dialog 
        open={dialogEditarAberto} 
        onOpenChange={(open) => {
          setDialogEditarAberto(open);
          if (!open) setAssociadoSelecionado(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Editar Associado</DialogTitle>
            <DialogDescription>Atualize os dados do associado {associadoSelecionado?.nome_completo}</DialogDescription>
          </DialogHeader>
          {associadoSelecionado && (
            <AssociadoDetalhes 
              modo="editar" 
              associado={associadoSelecionado}
              onSuccess={() => {
                setDialogEditarAberto(false);
                setAssociadoSelecionado(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
