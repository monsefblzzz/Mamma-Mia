import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dbService } from './db/DatabaseService';
import { MenuItem, Order, CartItem, StoreSettings, INITIAL_STORE_SETTINGS, InventoryItem, INVENTORY, MENU_ITEMS } from './types';
import { v4 as uuidv4 } from 'uuid';

interface StoreState {
  menuItems: MenuItem[];
  categories: string[];
  orders: Order[];
  cart: CartItem[];
  storeSettings: StoreSettings;
  inventory: InventoryItem[];
  isLoading: boolean;

  initDb: () => Promise<void>;
  fetchData: () => Promise<void>;
  
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  reorderMenuItems: (items: MenuItem[]) => void;
  rateMenuItem: (id: string, rating: number) => void;
  
  reorderCategories: (cats: string[]) => void;

  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number, notes?: string) => void;
  clearCart: () => void;

  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  updateInventoryStock: (id: string, newStock: number) => void;
}

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      menuItems: MENU_ITEMS,
      categories: Array.from(new Set(MENU_ITEMS.map((i: MenuItem) => i.category))),
      orders: [],
      cart: [],
      storeSettings: INITIAL_STORE_SETTINGS,
      inventory: INVENTORY,
      isLoading: true,
      
      initDb: async () => {
        await dbService.init();
        dbService.subscribe(() => {
          get().fetchData();
        });
        await get().fetchData();
        set({ isLoading: false });
      },

      fetchData: async () => {
        // Fetch from PGLite
        const dbProducts = await dbService.getProducts();
        const mappedProducts: MenuItem[] = dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: Number(p.price),
          category: p.category_name || 'Sin Categoría',
          image: p.image_url,
          allergy_info: p.allergens ? p.allergens.join(', ') : '',
        }));

        const dbOrders = await dbService.getOrders();
        // map dbOrders to Order type
        const mappedOrders: Order[] = dbOrders.map((o: any) => ({
          id: o.id.toString(),
          customer: o.customer_name,
          time: new Date(o.created_at).toLocaleTimeString() || '',
          date: new Date(o.created_at).toLocaleDateString() || '',
          createdAt: new Date(o.created_at).getTime(),
          items: [], 
          status: o.status.toUpperCase(),
          type: 'RECOGIDA',
          total: Number(o.total)
        }));

        // Initial UI could show MENU_ITEMS if DB is empty, but we seed the DB initially.
        const menuItems = mappedProducts.length > 0 ? mappedProducts : MENU_ITEMS;
        const activeCats = Array.from(new Set(menuItems.map(i => i.category)));
        
        set({ orders: mappedOrders, menuItems, categories: activeCats });
      },

      addMenuItem: (item) => {
        dbService.upsertProduct(item);
        set((state) => {
          const newItems = [...state.menuItems, item];
          const activeCats = Array.from(new Set(newItems.map(i => i.category)));
          return { menuItems: newItems, categories: activeCats };
        });
      },
      updateMenuItem: (id, updated) => {
        dbService.upsertProduct(updated);
        set((state) => ({
          menuItems: state.menuItems.map(item => item.id === id ? updated : item)
        }));
      },
      deleteMenuItem: (id) => {
        dbService.deleteProduct(id);
        set((state) => ({
          menuItems: state.menuItems.filter(item => item.id !== id)
        }));
      },
      reorderMenuItems: (items) => set({ menuItems: items }),
      rateMenuItem: (id, rating) => set((state) => ({
        menuItems: state.menuItems.map(item => {
          if (item.id === id) {
            const currentCount = item.ratingCount || 0;
            const currentTotal = (item.rating || 0) * currentCount;
            const newCount = currentCount + 1;
            const newRating = (currentTotal + rating) / newCount;
            return { ...item, rating: newRating, ratingCount: newCount };
          }
          return item;
        })
      })),

      reorderCategories: (cats) => set({ categories: cats }),

      addOrder: (order) => {
        set((state) => ({ orders: [order, ...state.orders] }));
        // also save to PGLite
        const itemsToSave = order.items.map(i => ({ productId: 'p1', qty: 1, notes: i })); // mocking mapped items
        dbService.createComplexOrder(order.customer, order.phone, itemsToSave);
      },
      
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),

      addToCart: (item, quantity = 1, notes = '') => set((state) => {
        const existing = state.cart.find(c => c.menuItem.id === item.id && c.notes === notes);
        if (existing) {
          return { cart: state.cart.map(c => c.menuItem.id === item.id && c.notes === notes ? { ...c, quantity: c.quantity + quantity } : c) };
        }
        return { cart: [...state.cart, { menuItem: item, quantity, notes }] };
      }),
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter(c => c.menuItem.id !== itemId)
      })),
      updateCartItem: (itemId, quantity, notes) => set((state) => ({
        cart: state.cart.map(c => c.menuItem.id === itemId ? { ...c, quantity, notes: notes !== undefined ? notes : c.notes } : c)
      })),
      clearCart: () => set({ cart: [] }),

      updateStoreSettings: (settings) => set((state) => ({
        storeSettings: { ...state.storeSettings, ...settings }
      })),

      updateInventoryStock: (id, newStock) => set((state) => ({
        inventory: state.inventory.map(item => {
          if (item.id === id) {
             let status = item.status;
             if (newStock === 0) status = 'Out of Stock';
             else if (newStock <= item.minLevel) status = 'Low Stock';
             else status = 'In Stock';
             return { ...item, currentStock: newStock, status: status as InventoryItem['status'] };
          }
          return item;
        })
      }))
    }),
    {
      name: 'mamma-mia-storage',
      partialize: (state) => ({ 
        cart: state.cart,
        storeSettings: state.storeSettings
      }),
    }
  )
);
