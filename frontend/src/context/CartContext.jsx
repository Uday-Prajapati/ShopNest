import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn || !user?.username) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getCart(user.username);
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user?.username]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!user?.username) return null;
    const updated = await api.addToCart(user.username, productId, quantity);
    setCart(updated);
    return updated;
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user?.username) return null;
    const updated = await api.updateCartItem(user.username, itemId, quantity);
    setCart(updated);
    return updated;
  };

  const removeItem = async (itemId) => {
    if (!user?.username) return null;
    const updated = await api.removeCartItem(user.username, itemId);
    setCart(updated);
    return updated;
  };

  const clear = async () => {
    if (!user?.username) return null;
    const updated = await api.clearCart(user.username);
    setCart(updated);
    return updated;
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
