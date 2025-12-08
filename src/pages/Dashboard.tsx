/**
 * Página Dashboard Principal
 * Exibe diferentes visualizações para Admin e Associado
 */

import { useAuth } from '@/hooks/useAuth';
import { DashboardAdmin } from '@/components/dashboard/DashboardAdmin';
import { DashboardAssociado } from '@/components/dashboard/DashboardAssociado';

export default function Dashboard() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  
  return isAdmin ? <DashboardAdmin /> : <DashboardAssociado />;
}
