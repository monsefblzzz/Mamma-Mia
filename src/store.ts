import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { dbService } from './db/DatabaseService';
import { MenuItem, Order, CartItem, StoreSettings, INITIAL_STORE_SETTINGS, InventoryItem, INVENTORY, MENU_ITEMS, getProductImage } from './types';
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
      categories: ["Pizzas", "Hamburguesas", "Aperitivos", "Bocadillos", "Patatas Fritas", "Menú Infantil", "Menús Especiales", "Ensaladas", "Bebidas", "Postres"],
      orders: [],
      cart: [],
      storeSettings: INITIAL_STORE_SETTINGS,
      inventory: INVENTORY.map(item => ({
        ...item,
        image: `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=200&auto=format&fit=crop&sig=${item.id}`
      })),
      isLoading: true,
      
      initDb: async () => {
        await dbService.init();
        dbService.subscribe(() => {
          get().fetchData();
        });
        await get().fetchData();

        // Check if VAPID keys exist after fetching from store
        const st = get().storeSettings;
        if (!st.vapidKey || !st.vapidPrivateKey) {
            try {
                const res = await fetch('/api/push/generate-keys');
                const keys = await res.json();
                get().updateStoreSettings({ vapidKey: keys.publicKey, vapidPrivateKey: keys.privateKey });
            } catch (e) {
                console.error("Failed to automatically generate VAPID keys:", e);
            }
        }

        // Listen to Firebase Orders
        onSnapshot(collection(db, 'orders'), (snapshot) => {
           const firebaseOrders: Order[] = [];
           snapshot.forEach(doc => {
              firebaseOrders.push(doc.data() as Order);
           });
           
           // Sort by most recent
           firebaseOrders.sort((a,b) => b.createdAt - a.createdAt);
           set({ orders: firebaseOrders });
        }, (error) => {
           handleFirestoreError(error, OperationType.GET, 'orders');
        });

        set({ isLoading: false });
      },

      fetchData: async () => {
        // Fetch from PGLite
        const dbProducts = await dbService.getProducts();
        // Fallback photos
        const getFallbackImage = (category: string, id: string, name: string) => {
           const lowerName = name.toLowerCase();
           
           // Specific overrides
           if (lowerName.includes('coca-cola') || lowerName.includes('coca cola')) {
               return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('fanta')) {
               return 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('botella agua')) {
               return 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('cerveza') || lowerName.includes('litrona')) {
               return 'https://images.unsplash.com/photo-1614316654388-349f46b45a03?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('alitas') || lowerName.includes('wings')) {
               return 'https://images.unsplash.com/photo-1569691899455-88464f6d3cb1?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('nuggets')) {
               return 'https://images.unsplash.com/photo-1562967914-608f828290e0?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('aros de cebolla')) {
               return 'https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('tequeño') || lowerName.includes('tequeno')) {
               return 'https://images.unsplash.com/photo-1510693050186-2a31be8e9cf9?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('helado') || lowerName.includes('ben & jerry')) {
               return 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('croqueta')) {
               return 'https://images.unsplash.com/photo-1631481970220-4bef0772de0c?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('patata') || lowerName.includes('fries') || lowerName.includes('frita')) {
               return 'https://images.unsplash.com/photo-1576107255648-936b801a2c3a?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('brava')) {
               return 'https://images.unsplash.com/photo-1626245137257-229202ed99aa?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('ensalada')) {
               return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('bocadillo')) {
               return 'https://images.unsplash.com/photo-1619860627588-ac0fb0b3b9ce?q=80&w=600&auto=format&fit=crop';
           }
           if (lowerName.includes('hamburguesa')) {
               return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop';
           }

           // If it's a category we want to handle with AI
           const targetCategories = ['APERITIVOS', 'BEBIDAS', 'BOCADILLOS', 'MENU INFANTIL', 'MENUS ESPECIALES', 'PATATAS FRITAS'];
           if (targetCategories.includes(category.toUpperCase())) {
               // Translate to english for better pollinations prompt
               let term = name;
               if (lowerName.includes('toro')) term = 'burger slider with meat';
               return `https://image.pollinations.ai/prompt/${encodeURIComponent(term + ' delicious restaurant food photography 4k')}?width=600&height=400&nologo=true`;
           }

           let base = 'https://images.unsplash.com/photo-1414235077428-33898bd12255';
           if (category === 'Pizzas') base = 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
           
           return `${base}?q=80&w=600&auto=format&fit=crop&sig=${id}`;
        };

        const mappedProducts: MenuItem[] = dbProducts.map((p: any) => {
          const category = p.category_name || p.category || 'Sin Categoría';
          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price),
            category,
            image: getProductImage(p.name) || p.image_url || p.image || getFallbackImage(category, p.id, p.name),
            allergy_info: p.allergens ? (Array.isArray(p.allergens) ? p.allergens.join(', ') : p.allergens) : (p.allergy_info || ''),
          };
        });

        mappedProducts.sort((a, b) => {
           if (a.category === b.category) {
              return a.name.localeCompare(b.name);
           }
           return a.category.localeCompare(b.category);
        });

        // Initial UI could show MENU_ITEMS if DB is empty, but we seed the DB initially.
        const menuItems = mappedProducts.length > 0 ? mappedProducts : MENU_ITEMS;
        // Keep existing categories order, append any new ones
        const currentCats = get().categories || [];
        const dbCats = Array.from(new Set(menuItems.map(i => i.category)));
        
        const DESIRED_ORDER = [
          "Pizzas",
          "Hamburguesas",
          "Aperitivos",
          "Bocadillos",
          "Patatas Fritas",
          "Menú Infantil",
          "Menús Especiales",
          "Ensaladas",
          "Bebidas",
          "Postres"
        ];
        
        // Let's migrate their local array to the desired order if it doesn't match the new required structure
        // If Pizzas isn't first, forcefully apply the new order.
        let finalCats = [...currentCats.filter(c => dbCats.includes(c)), ...dbCats.filter(c => !currentCats.includes(c))];
        
        const isLegacyAlphabetical = finalCats[0] === 'Aperitivos' && finalCats[1] === 'Bebidas';
        if (isLegacyAlphabetical) {
           finalCats = [...DESIRED_ORDER.filter(c => dbCats.includes(c)), ...dbCats.filter(c => !DESIRED_ORDER.includes(c))];
        }
        
        set({ menuItems, categories: finalCats });
      },

      addMenuItem: (item) => {
        dbService.upsertProduct(item);
        set((state) => {
          const newItems = [...state.menuItems, item];
          const currentCats = state.categories || [];
          const activeCats = currentCats.includes(item.category) 
             ? currentCats 
             : [...currentCats, item.category];
          
          // Send broadcast push
          const st = get().storeSettings;
          if (st.vapidKey && st.vapidPrivateKey) {
             fetch('/api/push/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vapidKey: st.vapidKey,
                    vapidPrivateKey: st.vapidPrivateKey,
                    title: '¡Nuevo producto en la carta!',
                    body: `Hemos añadido "${item.name}" a nuestra categoría ${item.category}. ¡Anímate a probarlo!`
                })
             }).catch(console.error);
          }

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
        // Firebase sync
        const orderId = order.id || Date.now().toString();
        const firebaseOrder = { ...order, id: orderId };
        
        setDoc(doc(db, 'orders', orderId), firebaseOrder).catch(error => {
          handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
        });
      },
      
      updateOrderStatus: (id, status) => {
        // update locally for optimistic UI
        set((state) => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
        }));

        // Firebase Sync
        updateDoc(doc(db, 'orders', id), { status }).catch(error => {
           handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
        });

        const orderParams = get().orders.find(o => o.id === id);

        if (status === 'LISTO' || status === 'EN_REPARTO') {
           if ('serviceWorker' in navigator && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
               navigator.serviceWorker.ready.then(reg => {
                   reg.showNotification(`Tu pedido está ${status === 'LISTO' ? 'Listo para recoger' : 'En Reparto'}`, {
                       body: `El estado del pedido #${id} se ha actualizado a ${status}.`,
                       icon: '/icon.svg',
                       // @ts-ignore
                       vibrate: [200, 100, 200],
                       data: '/'
                   });
               }).catch(console.error);
           }
           
           // Send server push
           if (orderParams && orderParams.phone) {
               const st = get().storeSettings;
               if (st.vapidKey && st.vapidPrivateKey) {
                   fetch('/api/push/notify', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({
                           phone: orderParams.phone,
                           vapidKey: st.vapidKey,
                           vapidPrivateKey: st.vapidPrivateKey,
                           title: `Tu pedido está ${status === 'LISTO' ? 'Listo para recoger' : 'En Reparto'}`,
                           body: `El estado del pedido #${id} se ha actualizado a ${status}.`
                       })
                   }).catch(console.error);
               }
           }
        }
      },

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

      updateInventoryStock: (id, newStock) => {
        let shouldAlert = false;
        let itemName = "";
        let minLevel = 0;

        set((state) => ({
          inventory: state.inventory.map(item => {
            if (item.id === id) {
               if (newStock < item.minLevel && item.currentStock >= item.minLevel) {
                   shouldAlert = true;
                   itemName = item.name;
                   minLevel = item.minLevel;
               }
               let status = item.status;
               if (newStock === 0) status = 'Out of Stock';
               else if (newStock <= item.minLevel) status = 'Low Stock';
               else status = 'In Stock';
               return { ...item, currentStock: newStock, status: status as InventoryItem['status'] };
            }
            return item;
          })
        }));

        if (shouldAlert) {
           fetch('/api/inventory/alert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, name: itemName, stock: newStock, minLevel })
           }).catch(console.error);
        }
      }
    }),
    {
      name: 'mamma-mia-storage',
      partialize: (state) => ({ 
        cart: state.cart,
        categories: state.categories,
        storeSettings: state.storeSettings
      }),
    }
  )
);
