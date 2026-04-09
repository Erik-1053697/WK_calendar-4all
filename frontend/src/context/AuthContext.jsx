import { useEffect, useMemo, useState } from 'react';
import { api, ensureCsrfCookie } from '../services/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapUser();
  }, []);

  async function bootstrapUser() {
    try {
      const response = await api.get('/user');
      setUser(response.data.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error(error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(payload) {
    await ensureCsrfCookie();
    const response = await api.post('/login', payload);
    setUser(response.data.data);
    return response.data.data;
  }

  async function register(payload) {
    await ensureCsrfCookie();
    const response = await api.post('/register', payload);
    setUser(response.data.data);
    return response.data.data;
  }

  async function logout() {
    await api.post('/logout');
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser: bootstrapUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
