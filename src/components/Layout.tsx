/**
 * Layout principal da aplicação
 * Contém navegação lateral e header
 * Responsivo para mobile com menu hamburger
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Calendar,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Item de menu de navegação
 */
interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

/**
 * Layout com sidebar e conteúdo principal
 */
export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const isAdmin = userRole === 'admin';
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Itens do menu de navegação
  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Associados', path: '/associados', adminOnly: true },
    { icon: DollarSign, label: 'Financeiro', path: '/financeiro', adminOnly: true },
    { icon: FileText, label: 'Relatórios', path: '/relatorios', adminOnly: true },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes', adminOnly: true },
  ];
  
  /**
   * Realiza logout do usuário
   */
  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/');
  };
  
  // Filtra itens do menu baseado em permissões
  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  /**
   * Conteúdo da navegação (reutilizado em desktop e mobile)
   */
  const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Logo/Header */}
      <div className="border-b border-border p-4 md:p-6">
        <h1 className="text-lg md:text-xl font-bold text-primary">Sistema de Gestão</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Clube Associativo</p>
      </div>
      
      {/* User Info */}
      <div className="border-b border-border p-3 md:p-4 bg-accent/50">
        <p className="text-xs md:text-sm font-medium text-foreground truncate">{user?.email}</p>
        <p className="text-xs text-muted-foreground">
          {isAdmin ? 'Administrador' : 'Associado'}
        </p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={onItemClick}
            >
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 text-sm',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="border-t border-border p-3 md:p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            onItemClick?.();
            handleLogout();
          }}
        >
          <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          Sair
        </Button>
      </div>
    </>
  );
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-primary">Sistema de Gestão</h1>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-full flex-col">
                <NavigationContent onItemClick={() => setMobileMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r border-border bg-card">
          <div className="flex h-full flex-col">
            <NavigationContent />
          </div>
        </aside>
      )}
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto",
        isMobile && "pt-14"
      )}>
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
