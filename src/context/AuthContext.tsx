
"use client";
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void; // Added updateUser
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to load user from localStorage on initial load
    const storedUser = localStorage.getItem('hallHubUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('hallHubUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    // Ensure avatarDataUrl is part of the initial login if it exists in userData
    const userToStore: User = {
      ...userData,
      avatarDataUrl: userData.avatarDataUrl || undefined,
    };
    setUser(userToStore);
    localStorage.setItem('hallHubUser', JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hallHubUser');
    localStorage.removeItem('token'); // Also clear the JWT token
    router.push('/'); // Redirect to landing page on logout
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      localStorage.setItem('hallHubUser', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
