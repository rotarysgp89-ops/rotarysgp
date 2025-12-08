/**
 * Componente para proteção de rotas
 * Redireciona usuários não autenticados para login
 * Redireciona usuários sem permissão para dashboard
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'associado';
}

/**
 * Wrapper para rotas protegidas
 * @param children - Componente filho a ser renderizado se autorizado
 * @param requireRole - Role necessária para acessar (opcional)
 */
export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, userRole } = useAuth();
  
  // Redireciona para login se não autenticado
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Redireciona para dashboard se não tem a role necessária
  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};
