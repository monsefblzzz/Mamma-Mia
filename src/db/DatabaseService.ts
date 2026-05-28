import localforage from 'localforage';
import { MENU_ITEMS } from '../types';

localforage.config({
  name: 'SereneSpaceDB',
  version: 1.0,
  storeName: 'serenedb',
  description: 'Offline-first highly durable database for Serene Space app.'
});

export class DatabaseService {
  private subscribers: Set<() => void> = new Set();
  private products: any[] = [...MENU_ITEMS];
  private orders: any[] = [];
  
  async init() {
    try {
      const storedProducts = await localforage.getItem<any[]>('products');
      if (storedProducts && storedProducts.length > 0) {
        this.products = storedProducts;
      } else {
        const imageMap: Record<string, string> = {
          'Aperitivos': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop',
          'Bebidas': 'https://images.unsplash.com/photo-1510615469950-8b98e1a1219b?w=800&auto=format&fit=crop',
          'Bocadillos': 'https://images.unsplash.com/photo-1627308595229-7830f5c92f8b?w=800&auto=format&fit=crop',
          'Menú Infantil': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop',
          'Menús Especiales': 'https://images.unsplash.com/photo-1587895240292-6f29fa7ac870?w=800&auto=format&fit=crop',
          'Patatas Fritas': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop',
          'Pizzas': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop',
          'Hamburguesas': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
          'Ensaladas': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
          'Postres': 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cf?w=800&auto=format&fit=crop'
        };
        this.products = MENU_ITEMS.map((item: any) => ({
           ...item,
           image: item.image || imageMap[item.category] || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop'
        }));
        await localforage.setItem('products', this.products);
      }
      
      const storedOrders = await localforage.getItem<any[]>('orders');
      if (storedOrders) {
        this.orders = storedOrders;
      }
    } catch (e) {
      console.error("Critical DB Init Error", e);
    }
    this.notify();
  }

  // Reactive Subscription
  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb());
  }

  async syncData() {
    try {
      await localforage.setItem('products', this.products);
      await localforage.setItem('orders', this.orders);
    } catch (e) {
      console.error("DB Sync Error", e);
    }
  }

  async getProducts() {
    return this.products;
  }

  async getCategories() {
    return Array.from(new Set(this.products.map(p => p.category))).map((name, id) => ({ id, name }));
  }

  async getOrdersHistory(phone: string) {
    return this.orders.filter(o => o.customer_phone === phone);
  }

  async getOrders() {
    return this.orders;
  }

  async createComplexOrder(
    customer: string, 
    phone: string | undefined, 
    items: Array<{productId: string, qty: number, notes?: string}>,
    extra?: { type?: string, table?: string, address?: string, paymentMethod?: string }
  ) {
    const total = items.reduce((sum, item) => {
      const p = this.products.find(x => x.id === item.productId) || MENU_ITEMS.find(x => x.id === item.productId);
      return sum + ((p?.price || 10) * item.qty);
    }, 0);

    const newOrder = {
      id: Date.now(),
      customer_name: customer,
      customer_phone: phone || '',
      status: 'pending',
      total,
      created_at: new Date().toISOString(),
      type: extra?.type || 'DOMICILIO',
      table_number: extra?.table || null,
      address: extra?.address || null,
      payment_method: extra?.paymentMethod || 'EFECTIVO',
      items: items.map(i => {
        const p = this.products.find(x => x.id === i.productId) || MENU_ITEMS.find(x => x.id === i.productId);
        return {
          name: p ? p.name : i.productId,
          quantity: i.qty,
          notes: i.notes || ''
        };
      })
    };
    
    this.orders.push(newOrder);
    await this.syncData();
    this.notify();
    return newOrder.id;
  }

  async updateOrderStatus(orderId: number, status: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      await this.syncData();
      this.notify();
    }
  }

  async upsertProduct(product: any) {
    const idx = this.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      this.products[idx] = product;
    } else {
      this.products.push(product);
    }
    await this.syncData();
    this.notify();
  }

  async deleteProduct(productId: string) {
    this.products = this.products.filter(p => p.id !== productId);
    await this.syncData();
    this.notify();
  }

  async getIngredients() { return []; }
  async addIngredient(i: any) {}
  async updateIngredient(id: number, i: any) {}
  async deleteIngredient(id: number) {}
}

export const dbService = new DatabaseService();
