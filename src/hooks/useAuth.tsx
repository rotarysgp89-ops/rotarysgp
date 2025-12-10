/**
 * Hook personalizado para gerenciar autenticação com Lovable Cloud
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'admin' | 'associado' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'associado' | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar role do usuário
  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setUserRole(data.role);
    }
  };

  useEffect(() => {
    // Setup auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer fetching user role
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password ?? '';

    if (!cleanEmail) {
      return { error: new Error('Email é obrigatório') };
    }

    if (cleanPassword.length < 6) {
      return { error: new Error('Senha inválida (mínimo 6 caracteres)') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      return { error: error as Error | null };
    } catch (err: any) {
      console.error('Erro no signIn:', err);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password ?? '';
    const cleanNome = nome?.trim();

    if (!cleanEmail) {
      return { error: new Error('Email é obrigatório') };
    }

    if (cleanPassword.length < 6) {
      return { error: new Error('Senha deve ter no mínimo 6 caracteres') };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            nome: cleanNome,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      return { error: error as Error | null };
    } catch (err: any) {
      console.error('Erro no signUp:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
