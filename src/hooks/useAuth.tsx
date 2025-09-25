import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import PhoneCollectionDialog from '@/components/PhoneCollectionDialog';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check if user needs phone number (mandatory for all users)
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user has a profile with phone number
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('phone')
                .eq('user_id', session.user.id)
                .single();

              // Show phone dialog if user doesn't have phone number
              if (!profile?.phone || profile.phone === '') {
                setShowPhoneDialog(true);
              }
            } catch (error) {
              console.error('Error checking profile:', error);
              // If no profile exists yet, also show dialog
              setShowPhoneDialog(true);
            }
          }, 100);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { 
            full_name: fullName || '',
            phone: phone || ''
          }
        }
      });
      return { error };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: { message: 'فشل في إنشاء الحساب. يرجى التحقق من الاتصال والمحاولة مرة أخرى.' } as any };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: { message: 'فشل في الاتصال بالخادم. يرجى التحقق من الاتصال والمحاولة مرة أخرى.' } as any };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
      {user && showPhoneDialog && (
        <PhoneCollectionDialog
          isOpen={showPhoneDialog}
          onClose={() => setShowPhoneDialog(false)}
          userId={user.id}
          userEmail={user.email || ''}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}