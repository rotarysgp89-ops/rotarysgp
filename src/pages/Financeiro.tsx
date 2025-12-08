/**
 * Página de Gestão Financeira
 * Gerencia plano de contas e lançamentos
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanoContas } from '@/components/financeiro/PlanoContas';
import { Lancamentos } from '@/components/financeiro/Lancamentos';

export default function Financeiro() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão Financeira</h1>
        <p className="text-muted-foreground mt-1">Gerencie as finanças do clube</p>
      </div>
      
      <Tabs defaultValue="lancamentos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="plano-contas">Plano de Contas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lancamentos" className="mt-6">
          <Lancamentos />
        </TabsContent>
        
        <TabsContent value="plano-contas" className="mt-6">
          <PlanoContas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
