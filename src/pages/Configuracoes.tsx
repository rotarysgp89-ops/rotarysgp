/**
 * Página de Configurações
 * Gerencia usuários do sistema (apenas admin)
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info, Plus, Users, Settings, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  role: 'admin' | 'associado';
}

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  
  // Form states - Criar
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState<'admin' | 'associado'>('associado');
  
  // Form states - Editar
  const [editNome, setEditNome] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'associado'>('associado');
  const [editAtivo, setEditAtivo] = useState(true);

  // Busca usuários do sistema
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios-sistema'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');
      
      if (profilesError) throw profilesError;
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      return profiles.map(profile => ({
        ...profile,
        role: roles.find(r => r.user_id === profile.id)?.role || 'associado'
      })) as Usuario[];
    },
  });

  // Criar usuário
  const createUser = useMutation({
    mutationFn: async ({ email, senha, nome, role }: { email: string; senha: string; nome: string; role: 'admin' | 'associado' }) => {
      const response = await supabase.functions.invoke('create-user', {
        body: { email, password: senha, nome, role }
      });
      
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-sistema'] });
      toast.success('Usuário criado com sucesso');
      setDialogAberto(false);
      limparFormCriar();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar usuário');
    }
  });

  // Atualizar usuário
  const updateUser = useMutation({
    mutationFn: async ({ userId, nome, role, ativo }: { userId: string; nome: string; role: 'admin' | 'associado'; ativo: boolean }) => {
      const response = await supabase.functions.invoke('manage-user', {
        body: { action: 'update', userId, nome, role, ativo }
      });
      
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-sistema'] });
      toast.success('Usuário atualizado com sucesso');
      setDialogEditarAberto(false);
      setUsuarioEditando(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar usuário');
    }
  });

  // Deletar usuário
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await supabase.functions.invoke('manage-user', {
        body: { action: 'delete', userId }
      });
      
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-sistema'] });
      toast.success('Usuário excluído com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir usuário');
    }
  });

  const limparFormCriar = () => {
    setEmail('');
    setSenha('');
    setNome('');
    setRole('associado');
  };

  const abrirDialogEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setEditNome(usuario.nome);
    setEditRole(usuario.role);
    setEditAtivo(usuario.ativo);
    setDialogEditarAberto(true);
  };

  const handleCriarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    createUser.mutate({ email, senha, nome, role });
  };

  const handleEditarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    updateUser.mutate({ userId: usuarioEditando.id, nome: editNome, role: editRole, ativo: editAtivo });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Gerencie usuários e configurações do sistema</p>
      </div>
      
      {/* Gerenciamento de Usuários */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>Controle de acessos ao sistema</CardDescription>
          </div>
          
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>Preencha os dados para criar um novo usuário no sistema.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCriarUsuario} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input 
                    id="nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    placeholder="Nome do usuário"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="email@exemplo.com"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <Input 
                    id="senha" 
                    type="password" 
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                    placeholder="Mínimo 6 caracteres"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Usuário *</Label>
                  <Select value={role} onValueChange={(v: 'admin' | 'associado') => setRole(v)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="associado">Associado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Admin:</strong> Acesso completo ao sistema<br />
                    <strong>Associado:</strong> Acesso limitado (dashboard e agenda)
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createUser.isPending}>
                    {createUser.isPending ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios?.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.nome}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.role === 'admin' ? 'default' : 'secondary'}>
                            {usuario.role === 'admin' ? 'Administrador' : 'Associado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.ativo ? 'outline' : 'destructive'}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => abrirDialogEditar(usuario)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={usuario.id === user?.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O usuário <strong>{usuario.nome}</strong> será removido permanentemente do sistema.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteUser.mutate(usuario.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {usuarios?.map((usuario) => (
                  <div key={usuario.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{usuario.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{usuario.email}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => abrirDialogEditar(usuario)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={usuario.id === user?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[95vw]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O usuário <strong>{usuario.nome}</strong> será removido permanentemente do sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col gap-2">
                              <AlertDialogCancel className="w-full">Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUser.mutate(usuario.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={usuario.role === 'admin' ? 'default' : 'secondary'}>
                        {usuario.role === 'admin' ? 'Admin' : 'Associado'}
                      </Badge>
                      <Badge variant={usuario.ativo ? 'outline' : 'destructive'}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Editar Usuário */}
      <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados do usuário {usuarioEditando?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditarUsuario} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editNome">Nome Completo *</Label>
              <Input 
                id="editNome" 
                value={editNome} 
                onChange={(e) => setEditNome(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editRole">Tipo de Usuário *</Label>
              <Select value={editRole} onValueChange={(v: 'admin' | 'associado') => setEditRole(v)}>
                <SelectTrigger id="editRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="associado">Associado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editAtivo">Status *</Label>
              <Select value={editAtivo ? 'ativo' : 'inativo'} onValueChange={(v) => setEditAtivo(v === 'ativo')}>
                <SelectTrigger id="editAtivo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogEditarAberto(false)}>Cancelar</Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Informações sobre o Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sobre o Sistema
          </CardTitle>
          <CardDescription>Informações da aplicação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Desenvolvedores responsáveis:</strong> Erick Silva, Arildo JR.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
