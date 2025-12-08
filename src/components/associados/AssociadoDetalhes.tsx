/**
 * Componente para exibir/editar detalhes de um associado
 * Inclui formulário completo e gestão de familiares
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssociados, useFamiliares, Associado, Familiar, Parentesco } from '@/hooks/useAssociados';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface AssociadoDetalhesProps {
  modo: 'criar' | 'editar';
  associado?: Associado;
  onSuccess?: () => void;
}

/**
 * Formulário de detalhes do associado
 */
export const AssociadoDetalhes = ({ modo, associado, onSuccess }: AssociadoDetalhesProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { createAssociado, updateAssociado } = useAssociados();
  const { familiares: familiaresExistentes, createFamiliar, deleteFamiliar } = useFamiliares(associado?.id || '');
  
  const [novosFamiliares, setNovosFamiliares] = useState<Omit<Familiar, 'id' | 'associado_id'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Adiciona um novo familiar temporário
   */
  const adicionarFamiliar = () => {
    const novoFamiliar: Omit<Familiar, 'id' | 'associado_id'> = {
      nome: '',
      parentesco: 'filho(a)',
      data_nascimento: new Date().toISOString().split('T')[0],
      cpf: ''
    };
    setNovosFamiliares([...novosFamiliares, novoFamiliar]);
  };
  
  /**
   * Remove um familiar temporário
   */
  const removerFamiliarTemp = (index: number) => {
    setNovosFamiliares(novosFamiliares.filter((_, i) => i !== index));
  };
  
  /**
   * Atualiza dados de um familiar temporário
   */
  const atualizarFamiliarTemp = (index: number, campo: keyof Omit<Familiar, 'id' | 'associado_id'>, valor: string) => {
    setNovosFamiliares(novosFamiliares.map((f, i) => 
      i === index ? { ...f, [campo]: valor } : f
    ));
  };
  
  /**
   * Salva o associado no banco de dados
   */
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = formRef.current;
    if (!form) return;
    
    const formData = new FormData(form);
    
    const dadosAssociado = {
      nome_completo: formData.get('nomeCompleto') as string,
      cpf: formData.get('cpf') as string,
      rg: formData.get('rg') as string,
      data_nascimento: formData.get('dataNascimento') as string,
      endereco_rua: formData.get('rua') as string,
      endereco_numero: formData.get('numero') as string,
      endereco_complemento: (formData.get('complemento') as string) || null,
      endereco_bairro: formData.get('bairro') as string,
      endereco_cidade: formData.get('cidade') as string,
      endereco_estado: formData.get('estado') as string,
      endereco_cep: formData.get('cep') as string,
      contato_telefone: formData.get('telefone') as string || '',
      contato_celular: formData.get('celular') as string,
      contato_email: formData.get('email') as string,
      status: 'ativo' as const,
      data_associacao: new Date().toISOString().split('T')[0],
      observacoes: (formData.get('observacoes') as string) || null,
    };
    
    try {
      if (modo === 'criar') {
        createAssociado(dadosAssociado, {
          onSuccess: (novoAssociado) => {
            // Salvar familiares após criar associado
            novosFamiliares.forEach(familiar => {
              if (familiar.nome) {
                createFamiliar({
                  ...familiar,
                  associado_id: novoAssociado.id,
                });
              }
            });
            setNovosFamiliares([]);
            onSuccess?.();
          },
          onSettled: () => setIsSubmitting(false),
        });
      } else if (associado) {
        updateAssociado({ id: associado.id, ...dadosAssociado }, {
          onSuccess: () => {
            // Salvar novos familiares
            novosFamiliares.forEach(familiar => {
              if (familiar.nome) {
                createFamiliar({
                  ...familiar,
                  associado_id: associado.id,
                });
              }
            });
            setNovosFamiliares([]);
            onSuccess?.();
          },
          onSettled: () => setIsSubmitting(false),
        });
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form ref={formRef} onSubmit={handleSalvar} className="space-y-6">
      {/* Dados Pessoais */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto">Nome Completo *</Label>
            <Input 
              id="nomeCompleto"
              name="nomeCompleto"
              defaultValue={associado?.nome_completo}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input 
              id="cpf"
              name="cpf"
              defaultValue={associado?.cpf}
              placeholder="000.000.000-00"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rg">RG *</Label>
            <Input 
              id="rg"
              name="rg"
              defaultValue={associado?.rg}
              placeholder="00.000.000-0"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
            <Input 
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              defaultValue={associado?.data_nascimento}
              required 
            />
          </div>
        </div>
      </div>
      
      {/* Endereço */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Endereço</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rua">Rua *</Label>
            <Input 
              id="rua"
              name="rua"
              defaultValue={associado?.endereco_rua}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numero">Número *</Label>
            <Input 
              id="numero"
              name="numero"
              defaultValue={associado?.endereco_numero}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input 
              id="complemento"
              name="complemento"
              defaultValue={associado?.endereco_complemento || ''}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro *</Label>
            <Input 
              id="bairro"
              name="bairro"
              defaultValue={associado?.endereco_bairro}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input 
              id="cidade"
              name="cidade"
              defaultValue={associado?.endereco_cidade}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estado">Estado *</Label>
            <Input 
              id="estado"
              name="estado"
              defaultValue={associado?.endereco_estado}
              maxLength={2}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <Input 
              id="cep"
              name="cep"
              defaultValue={associado?.endereco_cep}
              placeholder="00000-000"
              required 
            />
          </div>
        </div>
      </div>
      
      {/* Contato */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contato</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone"
              name="telefone"
              defaultValue={associado?.contato_telefone}
              placeholder="(00) 0000-0000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="celular">Celular *</Label>
            <Input 
              id="celular"
              name="celular"
              defaultValue={associado?.contato_celular}
              placeholder="(00) 00000-0000"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email"
              name="email"
              type="email"
              defaultValue={associado?.contato_email}
              required 
            />
          </div>
        </div>
      </div>
      
      {/* Familiares Existentes */}
      {modo === 'editar' && familiaresExistentes && familiaresExistentes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Familiares Cadastrados</h3>
          <div className="space-y-2">
            {familiaresExistentes.map((familiar) => (
              <div key={familiar.id} className="flex items-center justify-between border border-border rounded-lg p-3 bg-muted/50">
                <div>
                  <span className="font-medium">{familiar.nome}</span>
                  <span className="text-muted-foreground ml-2">({familiar.parentesco})</span>
                </div>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteFamiliar(familiar.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Novos Familiares */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {modo === 'editar' ? 'Adicionar Familiares' : 'Familiares'}
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={adicionarFamiliar}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Familiar
          </Button>
        </div>
        
        <div className="space-y-4">
          {novosFamiliares.map((familiar, index) => (
            <div key={index} className="border border-border rounded-lg p-4 bg-accent/50">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome</Label>
                  <Input 
                    value={familiar.nome}
                    onChange={(e) => atualizarFamiliarTemp(index, 'nome', e.target.value)}
                    placeholder="Nome do familiar"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Parentesco</Label>
                  <Select 
                    value={familiar.parentesco}
                    onValueChange={(value) => atualizarFamiliarTemp(index, 'parentesco', value as Parentesco)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cônjuge">Cônjuge</SelectItem>
                      <SelectItem value="filho(a)">Filho(a)</SelectItem>
                      <SelectItem value="pai/mãe">Pai/Mãe</SelectItem>
                      <SelectItem value="irmão/irmã">Irmão/Irmã</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="date"
                      value={familiar.data_nascimento}
                      onChange={(e) => atualizarFamiliarTemp(index, 'data_nascimento', e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      onClick={() => removerFamiliarTemp(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {novosFamiliares.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Nenhum familiar a adicionar
            </p>
          )}
        </div>
      </div>
      
      {/* Observações */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Observações</h3>
        <Textarea 
          name="observacoes"
          defaultValue={associado?.observacoes || ''}
          placeholder="Informações adicionais sobre o associado..."
          rows={4}
        />
      </div>
      
      {/* Botões de Ação */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {modo === 'criar' ? 'Cadastrar' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};
