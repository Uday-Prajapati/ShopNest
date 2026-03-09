import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  const getStoredToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  };

  const token = getStoredToken();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then((data) => {
        setUser(data);
        if (data?.roles && Array.isArray(data.roles) && data.roles.length > 0) {
          setRole(data.roles[0]);
        } else if (data?.role) {
          setRole(data.role);
        }
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        setUser(null);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (username, password, rememberMe = true) => {
    const res = await api.login(username, password);
    const accessToken = res.access_token || res.accessToken;
    if (accessToken) {
      if (rememberMe) {
        localStorage.setItem('accessToken', accessToken);
        sessionStorage.removeItem('accessToken');
      } else {
        sessionStorage.setItem('accessToken', accessToken);
        localStorage.removeItem('accessToken');
      }
      const resolvedRole =
        res.roles && Array.isArray(res.roles) && res.roles.length > 0
          ? res.roles[0]
          : res.role || null;
      setUser({ username: res.username, email: res.email, roles: res.roles || (resolvedRole ? [resolvedRole] : []) });
      setRole(resolvedRole);
    }
    return res;
  };

  const register = async (body) => {
    await api.register(body);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        register,
        logout,
        isLoggedIn: !!user,
        isCustomer: role === 'ROLE_CUSTOMER',
        isMerchant: role === 'ROLE_MERCHANT',
        isAdmin: role === 'ROLE_ADMIN',
        isDeliveryAgent: role === 'ROLE_DELIVERY_AGENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
