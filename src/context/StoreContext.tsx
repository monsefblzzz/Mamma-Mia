import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '../store';
import { MenuItem, Order, CartItem, StoreSettings, InventoryItem } from '../types';

interface StoreContextType {
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  reorderMenuItems: (items: MenuItem[]) => void;
  rateMenuItem: (id: string, rating: number) => void;
  
  categories: string[];
  reorderCategories: (cats: string[]) => void;

  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  cart: CartItem[];
  addToCart: (item: MenuItem | any, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number, notes?: string) => void;
  clearCart: () => void;

  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;

  inventory: InventoryItem[];
  updateInventoryStock: (id: string, newStock: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useAppStore();

  useEffect(() => {
    store.initDb();
  }, []);

  return (
    <StoreContext.Provider value={store as unknown as StoreContextType}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};

