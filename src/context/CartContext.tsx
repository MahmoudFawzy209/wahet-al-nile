'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartAddOn {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // Composite unique key: itemId-variantId-addOnIds
  menuItemId: string;
  name: string;
  imageUrl: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  addOns: CartAddOn[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('nile_oasis_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('nile_oasis_cart', JSON.stringify(items));
      } catch {
        // Ignore storage errors
      }
    }
  }, [items, isMounted]);

  const generateCartKey = (item: Omit<CartItem, 'id'>) => {
    const addOnKey = (item.addOns || [])
      .map((a) => a.id)
      .sort()
      .join(',');
    return `${item.menuItemId}_${item.variantId || 'base'}_${addOnKey}_${item.notes || ''}`;
  };

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const cartKey = generateCartKey(newItem);
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === cartKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, { ...newItem, id: cartKey }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const addOnsTotal = (item.addOns || []).reduce((aSum, a) => aSum + a.price, 0);
    const itemTotal = (item.unitPrice + addOnsTotal) * item.quantity;
    return sum + itemTotal;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
