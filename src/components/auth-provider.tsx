// src/components/auth-provider.tsx
'use client'

import * as React from 'react';
import { onAuthStateChangeObserver } from '@/services/auth';
import { usePathname, useRouter } from 'next/navigation';
import { User as FirebaseUser } from 'firebase/auth';
import Loading from '@/app/(dashboard)/loading';
import { getUserProfile, User } from '@/services/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [profile, setProfile] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChangeObserver(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.email);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && isPublicRoute) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <Loading />;
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  if (!user && !isPublicRoute) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ user, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
