import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, MENU_ITEMS, Order, ORDERS as INITIAL_ORDERS, CartItem, StoreSettings, INITIAL_STORE_SETTINGS, InventoryItem, INVENTORY } from '../types';

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
  addToCart: (item: MenuItem) => void;
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [categories, setCategories] = useState<string[]>(Array.from(new Set(MENU_ITEMS.map(i => i.category))));
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INVENTORY);
  const [isOrdersLoaded, setIsOrdersLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(INITIAL_ORDERS);
          fetch('/api/orders/batch', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({orders: INITIAL_ORDERS})
          }).catch(console.error);
        }
        setIsOrdersLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load orders', err);
        setOrders(INITIAL_ORDERS);
        setIsOrdersLoaded(true);
      });
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Sync categories whenever menuItems change (if new category is added)
  useEffect(() => {
    const activeCats = Array.from(new Set(menuItems.map(item => item.category)));
    setCategories(prev => {
      const newCats = activeCats.filter(c => !prev.includes(c));
      const validPrevCats = prev.filter(c => activeCats.includes(c));
      if (newCats.length > 0 || validPrevCats.length !== prev.length) {
        return [...validPrevCats, ...newCats];
      }
      return prev;
    });
  }, [menuItems]);

  const reorderCategories = (cats: string[]) => setCategories(cats);

  const addMenuItem = (item: MenuItem) => setMenuItems(prev => [...prev, item]);
  const updateMenuItem = (id: string, updated: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === id ? updated : item));
  };
  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };
  const reorderMenuItems = (items: MenuItem[]) => {
    setMenuItems(items);
  };
  const rateMenuItem = (id: string, rating: number) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const currentCount = item.ratingCount || 0;
        const currentTotal = (item.rating || 0) * currentCount;
        const newCount = currentCount + 1;
        const newRating = (currentTotal + rating) / newCount;
        return { ...item, rating: newRating, ratingCount: newCount };
      }
      return item;
    }));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    fetch('/api/orders', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(order)
    }).catch(console.error);
  };
  
  const updateOrderStatus = (id: string, status: Order['status']) => {
    const order = orders.find(o => o.id === id);
    if (order && order.status !== status) {
      if (status === 'LISTO' || status === 'EN_REPARTO') {
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = status === 'LISTO' ? '¡Tu pedido está listo!' : '¡Tu pedido está en camino!';
          const body = `El pedido #${id.substring(0, 6)} ahora está ${status === 'LISTO' ? 'listo para recoger' : 'en reparto'}.`;
          try {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                // @ts-ignore
                registration.showNotification(title, { 
                  body,
                  icon: '/icon.png'
                });
              });
            } else {
              new Notification(title, { body });
            }
          } catch (e) {
            console.error('Error showing notification', e);
          }
        }
      }
    }
    setOrders(prev => prev.map(o => {
      if (o.id === id && o.status !== status) {
        return { ...o, status };
      }
      return o;
    }));
    
    fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status})
    }).catch(console.error);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };
  const updateCartItem = (itemId: string, quantity: number, notes?: string) => {
    setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, quantity, notes: notes !== undefined ? notes : c.notes } : c));
  };
  const clearCart = () => setCart([]);

  const updateStoreSettings = (settings: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...settings }));
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        let status = item.status;
        if (newStock === 0) status = 'Out of Stock';
        else if (newStock <= item.minLevel) status = 'Low Stock';
        else status = 'In Stock';
        
        return { ...item, currentStock: newStock, status: status as InventoryItem['status'] };
      }
      return item;
    }));
  };

  return (
    <StoreContext.Provider value={{ 
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems, rateMenuItem,
      categories, reorderCategories,
      orders, addOrder, updateOrderStatus,
      cart, addToCart, removeFromCart, updateCartItem, clearCart,
      storeSettings, updateStoreSettings,
      inventory, updateInventoryStock
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
