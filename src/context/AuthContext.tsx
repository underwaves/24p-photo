import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiAuth, type AuthUser, getAuthToken } from '../lib/api';

export interface AdminUser extends AuthUser {}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        // เช็คกรณีเคยล็อกอิน demo ไว้
        const demoAuth = localStorage.getItem('palm_demo_auth');
        if (demoAuth === 'true') {
          setUser({
            id: 'admin-demo-id',
            email: 'admin@24pphoto.com',
            name: '24p PHOTO Admin',
          });
          setIsDemoMode(true);
        }
        setLoading(false);
        return;
      }

      try {
        const res = await apiAuth.me();
        if (res && res.user) {
          setUser(res.user);
          setIsDemoMode(false);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Auth token verification failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const res = await apiAuth.login(email, password);
      if (res && res.user) {
        setUser(res.user);
        setIsDemoMode(false);
        localStorage.removeItem('palm_demo_auth');
        return { error: null };
      }
      return { error: new Error('เข้าสู่ระบบไม่สำเร็จ') };
    } catch (err: unknown) {
      // หาก Worker หรือเน็ตเวิร์กมีปัญหา แต่กรอกรหัสถูกต้อง ให้เปิดโหมด fallback
      if (
        email === 'admin@24pphoto.com' &&
        (password === 'Admin@24pPhoto!' || password === 'admin123456')
      ) {
        localStorage.setItem('palm_demo_auth', 'true');
        const fallbackUser: AdminUser = {
          id: 'admin-fallback-id',
          email,
          name: '24p PHOTO Admin',
        };
        setUser(fallbackUser);
        setIsDemoMode(true);
        return { error: null };
      }

      return { error: err as Error };
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      await apiAuth.logout();
      localStorage.removeItem('palm_demo_auth');
      setUser(null);
      setIsDemoMode(false);
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
