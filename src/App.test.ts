import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dbService } from './db/DatabaseService';
import { useAppStore } from './store';

// Mock DB Service
vi.mock('./db/DatabaseService', () => {
  return {
    dbService: {
      init: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
      getOrders: vi.fn().mockResolvedValue([]),
      getProducts: vi.fn().mockResolvedValue([]),
      createComplexOrder: vi.fn().mockResolvedValue(1)
    }
  };
});

describe('useAppStore Data Flow & AI Compatibility', () => {
  beforeEach(() => {
    useAppStore.setState({
      cart: [],
      orders: [],
      menuItems: [{ id: 'p1', name: 'Pizza Test', price: 10, category: 'Pizzas' }] as any,
    });
    vi.clearAllMocks();
  });

  it('should initialize DB and sync state', async () => {
    const store = useAppStore.getState();
    await store.initDb();
    expect(dbService.init).toHaveBeenCalled();
    expect(dbService.subscribe).toHaveBeenCalled();
  });

  it('adds items to local-first cart', () => {
    const store = useAppStore.getState();
    const item = store.menuItems[0];
    
    // Test standard item
    store.addToCart(item, 1, 'Sin cebolla');
    
    expect(useAppStore.getState().cart.length).toBe(1);
    expect(useAppStore.getState().cart[0].notes).toBe('Sin cebolla');
  });

  it('supports half and half additions (Mitad y Mitad)', () => {
    const store = useAppStore.getState();
    const item = store.menuItems[0];
    
    store.addToCart(item, 1, 'Mitad Barbacoa, Mitad Queso');
    
    expect(useAppStore.getState().cart.length).toBe(1);
    expect(useAppStore.getState().cart[0].notes).toBe('Mitad Barbacoa, Mitad Queso');
  });
});
