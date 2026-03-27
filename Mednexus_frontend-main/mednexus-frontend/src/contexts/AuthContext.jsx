import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const STORAGE_KEY = 'mednexus-user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginWithEmail = (email) => {
    const mockUser = {
      id: `email:${email}`,
      email,
      name: email.split('@')[0] || 'Clinician',
      provider: 'email',
    };
    setUser(mockUser);
  };

  const loginWithGoogle = () => {
    // In real app, redirect to backend/OAuth. Here we mock.
    const mockUser = {
      id: 'google:demo-user',
      email: 'demo@mednexus.ai',
      name: 'MedNexus Clinician',
      provider: 'google',
    };
    setUser(mockUser);
  };

  const logout = () => setUser(null);

  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const name =
        updates.name !== undefined ? String(updates.name).trim() || prev.name : prev.name;
      const email =
        updates.email !== undefined ? String(updates.email).trim() || prev.email : prev.email;
      const next = { ...prev, name, email };
      if (prev.provider === 'email' && email && email !== prev.email) {
        next.id = `email:${email}`;
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loginWithEmail, loginWithGoogle, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};


