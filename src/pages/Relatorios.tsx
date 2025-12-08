/**
 * Página de Relatórios
 * Gera relatórios financeiros e de associados
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatorioFinanceiro } from '@/components/relatorios/RelatorioFinanceiro';
import { RelatorioAssociados } from '@/components/relatorios/RelatorioAssociados';

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gere relatórios detalhados</p>
      </div>
      
      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="financeiro">Relatório Financeiro</TabsTrigger>
          <TabsTrigger value="associados">Relatório de Associados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financeiro" className="mt-6">
          <RelatorioFinanceiro />
        </TabsContent>
        
        <TabsContent value="associados" className="mt-6">
          <RelatorioAssociados />
        </TabsContent>
      </Tabs>
    </div>
  );
}
