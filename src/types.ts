import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isPopular?: boolean;
  image?: string;
  tags?: string[];
  allergy_info?: string;
  rating?: number;
  recipe?: {
    ingredients: string[];
    steps: string[];
  };
  ratingCount?: number;
  stock?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  customer: string;
  phone?: string;
  time: string;
  date?: string;
  createdAt?: number;
  items: string[];
  status: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'EN_REPARTO' | 'COMPLETADO';
  type: 'DOMICILIO' | 'RECOGIDA' | 'MESA';
  total: number;
  address?: string;
  table?: string;
  paymentMethod?: 'EFECTIVO' | 'TARJETA' | 'PAYPAL' | 'BIZUM';
}

export interface StoreSettings {
  openingHours: string;
  deliveryZones: string[];
  deliveryFee: number;
  contactPhone: string;
}

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  openingHours: '12:00 - 16:00, 19:30 - 23:30',
  deliveryZones: ['Centro', 'Norte', 'Sur'],
  deliveryFee: 2.50,
  contactPhone: '+34 600 000 000',
};

export const MENU_ITEMS: MenuItem[] = [
  // PIZZAS
  { id: 'p1', name: 'Barbacoa', description: 'Tomate, mozzarella, bacon, cebolla y salsa barbacoa', price: 11.50, category: 'Pizzas', rating: 4.8, ratingCount: 124, isPopular: true },
  { id: 'p2', name: 'Carbonara', description: 'Nata, mozzarella, bacon, huevo y parmesano', price: 11.50, category: 'Pizzas', rating: 4.5, ratingCount: 89, isPopular: true },
  { id: 'p3', name: 'Búfalo', description: 'Tomate, mozzarella, carne picada, cebolla, pimiento rojo y salsa búfalo', price: 12.00, category: 'Pizzas', rating: 4.9, ratingCount: 201 },
  { id: 'p4', name: 'Colorado', description: 'Tomate, mozzarella, ternera, bacon, pimiento rojo', price: 12.50, category: 'Pizzas' },
  { id: 'p5', name: 'Cañada', description: 'Tomate, mozzarella, bacon, pollo, cebolla y mostaza', price: 12.00, category: 'Pizzas' },
  { id: 'p6', name: 'Manchega', description: 'Tomate, orégano, ajo, pimentón y queso manchego curado', price: 9.50, category: 'Pizzas' },
  { id: 'p7', name: 'Todolella', description: 'Tomate, tomate rodaja, mozzarella, jamón serrano, roquefort y olivas', price: 11.50, category: 'Pizzas' },
  { id: 'p8', name: 'Suprema Queso', description: 'Tomate, mozzarella, queso de cabra, cheddar, emmental, orégano', price: 12.00, category: 'Pizzas' },
  { id: 'p9', name: 'Cheese BBQ', description: 'Tomate, mozzarella, cheddar, carne picada, pollo barbacoa, cebolla, bacon', price: 12.00, category: 'Pizzas' },
  { id: 'p10', name: 'Jamón Serrano', description: 'Tomate, mozzarella, jamón serrano, ajo, tomate y orégano', price: 11.50, category: 'Pizzas' },
  
  // PIZZAS PICANTES
  { id: 'pp1', name: 'Mexicana', description: 'Tomate, mozzarella, ternera, frijol, jalapeño y salsa brava', price: 11.00, category: 'Pizzas' },
  { id: 'pp2', name: 'Tejana', description: 'Tomate, mozzarella, pollo picante, maíz y salsa brava', price: 10.50, category: 'Pizzas' },
  { id: 'pp3', name: 'Salvaje Oeste', description: 'Tomate, mozzarella, ternera, frankfurt, cebolla y tabasco', price: 12.00, category: 'Pizzas' },
  { id: 'pp4', name: 'Pepperoni', description: 'Tomate, mozzarella y pepperoni', price: 11.00, category: 'Pizzas' },

  // MÁS PIZZAS
  { id: 'mp1', name: 'Pedrón', description: 'Tomate, mozzarella, anchoas, olivas negras y alcaparras', price: 11.50, category: 'Pizzas' },
  { id: 'mp2', name: 'Bacon', description: 'Nata, mozzarella y bacon', price: 9.50, category: 'Pizzas' },
  { id: 'mp3', name: 'Prosciutto', description: 'Tomate, mozzarella y jamón york', price: 9.50, category: 'Pizzas' },
  { id: 'mp4', name: 'Caprichosa', description: 'Tomate, mozzarella, jamón york, alcachofas, champiñón y huevo', price: 11.00, category: 'Pizzas' },
  { id: 'mp5', name: '4 Estaciones', description: 'Tomate, mozzarella, jamón york, alcachofas, champiñón y longaniza', price: 11.00, category: 'Pizzas' },
  { id: 'mp6', name: '4 Quesos', description: 'Tomate, mozzarella, cheddar, camembert y roquefort', price: 11.50, category: 'Pizzas' },
  { id: 'mp7', name: 'Margarita', description: 'Tomate y mozzarella', price: 9.00, category: 'Pizzas' },
  { id: 'mp8', name: 'Calzone', description: 'Tomate, mozzarella y jamón york (tapada)', price: 12.00, category: 'Pizzas' },
  { id: 'mp9', name: 'Vegetal', description: 'Tomate, mozzarella y verduras asadas y pétalos de sal negra', price: 11.50, category: 'Pizzas' },
  { id: 'mp10', name: 'Romana', description: 'Tomate, mozzarella, jamón york, champiñones y olivas negras', price: 10.50, category: 'Pizzas' },
  { id: 'mp11', name: 'Musaka', description: 'Tomate, mozzarella, longaniza y berenjena', price: 11.00, category: 'Pizzas' },
  { id: 'mp12', name: 'Escalivada', description: 'Tomate, mozzarella, berenjena, pimiento rojo y cebolla', price: 10.50, category: 'Pizzas' },
  { id: 'mp13', name: 'Salmón', description: 'Nata, mozzarella, salmón, alcaparras y sucedáneo caviar', price: 12.00, category: 'Pizzas' },
  { id: 'mp14', name: 'Atún', description: 'Tomate, mozzarella, olivas verdes y atún', price: 10.50, category: 'Pizzas' },
  { id: 'mp15', name: 'Huevo', description: 'Tomate, mozzarella, bacon, cebolla y huevo', price: 10.50, category: 'Pizzas' },
  { id: 'mp16', name: 'Espinacas', description: 'Tomate, mozzarella, atún, queso de cabra y espinacas', price: 11.00, category: 'Pizzas' },
  { id: 'mp17', name: 'Prosciutto Funghi', description: 'Tomate, mozzarella, jamón york y champiñones', price: 10.00, category: 'Pizzas' },
  { id: 'mp18', name: 'Dátiles', description: 'Tomate, mozzarella, bacon, camembert y dátiles', price: 11.50, category: 'Pizzas' },
  { id: 'mp19', name: 'Paté', description: 'Tomate, mozzarella, bacon y paté de campaña', price: 10.50, category: 'Pizzas' },
  { id: 'mp20', name: 'Frankfurt', description: 'Tomate, mozzarella, huevo y frankfurt', price: 10.00, category: 'Pizzas' },
  { id: 'mp21', name: 'Tropical', description: 'Tomate, mozzarella, jamón york y piña', price: 10.00, category: 'Pizzas' },
  { id: 'mp22', name: 'Mamma Mia Porchetta', description: 'Tomate, mozzarella, pulled pork BBQ, pollo y pimiento rojo', price: 12.50, category: 'Pizzas' },
  { id: 'mp23', name: 'Juanito', description: 'Tomate, mozzarella, foie, pato confitado, champiñón y pétalos de sal negra', price: 13.50, category: 'Pizzas' },

  // HAMBURGUESAS
  { id: 'h1', name: 'Rubia', description: 'Hamburguesa vaca rubia gallega (130g), pulled pork, queso cheddar, cebolla caramelizada y brotes tiernos', price: 15.00, category: 'Hamburguesas' },
  { id: 'h2', name: 'Monster', description: 'Doble hamburguesa ternera (2 x 100g), doble queso, bacon, cebolla y barbacoa', price: 12.50, category: 'Hamburguesas' },
  { id: 'h3', name: 'Xtrem', description: 'Hamburguesa ternera (100g), queso, bacon, cebolla, huevo, tomate y brotes tiernos', price: 10.50, category: 'Hamburguesas' },
  { id: 'h4', name: 'Basic', description: 'Hamburguesa ternera, queso, tomate y brotes tiernos', price: 8.90, category: 'Hamburguesas' },
  { id: 'h5', name: 'Deliciosa', description: 'Delicia de pollo, bacon, tomate, mayonesa y brotes tiernos', price: 9.50, category: 'Hamburguesas' },

  // BOCADILLOS
  { id: 'b1', name: 'Paté', description: 'Paté, queso tomate y brotes tiernos', price: 8.00, category: 'Bocadillos' },
  { id: 'b2', name: 'Paté Especial', description: 'Paté, queso, tomate, bacon, huevo y brotes tiernos', price: 9.50, category: 'Bocadillos' },
  { id: 'b3', name: 'Lomo', description: 'Lomo, queso, tomate y brotes tiernos', price: 8.00, category: 'Bocadillos' },
  { id: 'b4', name: 'Pollo', description: 'Pechuga de pollo, pimiento verde, mayonesa y brotes tiernos', price: 8.00, category: 'Bocadillos' },

  // APERITIVOS
  { id: 'a1', name: 'Alitas de Pollo', description: '6 unidades', price: 6.00, category: 'Aperitivos' },
  { id: 'a2', name: 'Bolas de Patata', description: '12 unidades', price: 4.50, category: 'Aperitivos' },
  { id: 'a3', name: 'Croquetas Queso', description: '6 unidades', price: 6.00, category: 'Aperitivos' },
  { id: 'a4', name: 'Nuggets', description: '7 unidades', price: 6.00, category: 'Aperitivos' },
  { id: 'a5', name: 'Croquetón Jamón', description: '3 unidades', price: 6.00, category: 'Aperitivos' },
  { id: 'a6', name: 'Combo', description: '2 Nuggets, 2 croquetas queso, 1 croquetón jamón, 6 bolas patata', price: 7.00, category: 'Aperitivos' },
  { id: 'a7', name: 'Maxi Combo', description: '4 Nuggets, 4 croquetas queso, 2 croquetón jamón, 12 bolas patata', price: 13.00, category: 'Aperitivos' },

  // PATATAS FRITAS
  { id: 'pf1', name: 'Normales', description: 'Patatas fritas clásicas', price: 4.00, category: 'Patatas Fritas' },
  { id: 'pf2', name: 'Bacon Cheese Fries', description: 'Patatas con queso cheddar y bacon crujiente', price: 6.00, category: 'Patatas Fritas' },
  { id: 'pf3', name: 'Pulled Pork BBQ', description: 'Patatas con cerdo desmigado y salsa barbacoa', price: 8.00, category: 'Patatas Fritas' },

  // MENÚ INFANTIL
  { id: 'mi1', name: 'Pizza Infantil', description: 'Jamón york, bacon o frankfurt + 4 nuggets o patatas fritas + salsa + postre sorpresa', price: 8.00, category: 'Menú Infantil' },
  { id: 'mi2', name: 'Chicken & Fries', description: '4 nuggets + patatas fritas + salsa + postre sorpresa', price: 8.00, category: 'Menú Infantil' },

  // ENSALADAS
  { id: 'e1', name: 'Ensalada Pollo', description: 'Brotes tiernos, pechuga pollo, salsa césar, tomate cherry', price: 9.00, category: 'Ensaladas' },
  { id: 'e2', name: 'Ensalada Frutos Secos', description: 'Brotes tiernos, frutos secos, queso y aceite balsámico', price: 9.00, category: 'Ensaladas' },

  // MENÚ THE BOX
  { id: 'box1', name: 'Menú "The Box"', description: 'Pizza + Patatas + Aperitivo 1/2 Ración + Bebida', price: 13.50, category: 'Menús Especiales' }
];

export const INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Masa', category: 'Ingredientes', currentStock: 100, unit: 'uds', minLevel: 20, status: 'In Stock' },
  { id: 'i2', name: 'Masa de Single', category: 'Ingredientes', currentStock: 80, unit: 'uds', minLevel: 15, status: 'In Stock' },
  { id: 'i3', name: 'Masa de Infantil', category: 'Ingredientes', currentStock: 50, unit: 'uds', minLevel: 10, status: 'In Stock' },
  { id: 'ing_1', name: 'Tomate', category: 'Ingredientes', currentStock: 50, unit: 'kg', minLevel: 10, status: 'In Stock' },
  { id: 'ing_2', name: 'Mozzarella', category: 'Ingredientes', currentStock: 40, unit: 'kg', minLevel: 8, status: 'In Stock' },
  { id: 'ing_3', name: 'Bacon', category: 'Ingredientes', currentStock: 30, unit: 'kg', minLevel: 5, status: 'In Stock' },
  { id: 'ing_4', name: 'Cebolla', category: 'Ingredientes', currentStock: 25, unit: 'kg', minLevel: 5, status: 'In Stock' },
  { id: 'ing_5', name: 'Salsa Barbacoa', category: 'Ingredientes', currentStock: 15, unit: 'L', minLevel: 3, status: 'In Stock' },
  { id: 'ing_6', name: 'Nata', category: 'Ingredientes', currentStock: 20, unit: 'L', minLevel: 4, status: 'In Stock' },
  { id: 'ing_7', name: 'Huevo', category: 'Ingredientes', currentStock: 120, unit: 'uds', minLevel: 30, status: 'In Stock' },
  { id: 'ing_8', name: 'Ternera / Carne Picada', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 5, status: 'In Stock' },
  { id: 'ing_9', name: 'Pollo / Pechuga de Pollo', category: 'Ingredientes', currentStock: 20, unit: 'kg', minLevel: 5, status: 'In Stock' },
  { id: 'ing_10', name: 'Jamón York', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 4, status: 'In Stock' },
  { id: 'ing_11', name: 'Jamón Serrano', category: 'Ingredientes', currentStock: 10, unit: 'kg', minLevel: 3, status: 'In Stock' },
  { id: 'ing_12', name: 'Pepperoni', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 4, status: 'In Stock' },
  { id: 'ing_13', name: 'Champiñones', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 3, status: 'In Stock' },
  { id: 'ing_14', name: 'Queso Cheddar', category: 'Ingredientes', currentStock: 10, unit: 'kg', minLevel: 2, status: 'In Stock' },
  { id: 'ing_15', name: 'Queso Cabra / Emmental / Roquefort', category: 'Ingredientes', currentStock: 12, unit: 'kg', minLevel: 3, status: 'In Stock' },
  { id: 'ing_16', name: 'Pimiento Rojo / Verde', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 4, status: 'In Stock' },
  { id: 'ing_17', name: 'Olivas', category: 'Ingredientes', currentStock: 10, unit: 'kg', minLevel: 2, status: 'In Stock' },
  { id: 'ing_18', name: 'Frankfurt / Longaniza', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 3, status: 'In Stock' },
  { id: 'ing_19', name: 'Hamburguesa Vaca Rubia', category: 'Ingredientes', currentStock: 50, unit: 'uds', minLevel: 10, status: 'In Stock' },
  { id: 'ing_20', name: 'Pulled Pork', category: 'Ingredientes', currentStock: 10, unit: 'kg', minLevel: 2, status: 'In Stock' },
  { id: 'ing_21', name: 'Atún / Salmón / Anchoas', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 4, status: 'In Stock' },
  { id: 'ing_22', name: 'Croquetas / Nuggets / Bolas Patata', category: 'Ingredientes', currentStock: 300, unit: 'uds', minLevel: 50, status: 'In Stock' },
  { id: 'ing_23', name: 'Patatas Fritas Congeladas', category: 'Ingredientes', currentStock: 50, unit: 'kg', minLevel: 10, status: 'In Stock' },
  { id: 'ing_24', name: 'Brotes Tiernos / Ensalada', category: 'Ingredientes', currentStock: 5, unit: 'kg', minLevel: 1, status: 'In Stock' },
  
  { id: 'i4', name: 'Caja de Pizza', category: 'Envases', currentStock: 200, unit: 'uds', minLevel: 50, status: 'In Stock' },
  { id: 'i5', name: 'Caja de Infantil', category: 'Envases', currentStock: 100, unit: 'uds', minLevel: 30, status: 'In Stock' },
  { id: 'i6', name: 'Caja de Aperitivos Pequeña', category: 'Envases', currentStock: 150, unit: 'uds', minLevel: 40, status: 'In Stock' },
  { id: 'i7', name: 'Caja de Aperitivos Mediana', category: 'Envases', currentStock: 120, unit: 'uds', minLevel: 30, status: 'In Stock' },
  { id: 'i8', name: 'Caja de Aperitivos Larga', category: 'Envases', currentStock: 100, unit: 'uds', minLevel: 25, status: 'In Stock' },
  { id: 'i9', name: 'Caja de Aperitivos de Combo', category: 'Envases', currentStock: 80, unit: 'uds', minLevel: 20, status: 'In Stock' },
  { id: 'i10', name: 'Caja de Aperitivos de Maxi Combo', category: 'Envases', currentStock: 60, unit: 'uds', minLevel: 15, status: 'In Stock' },
  { id: 'i11', name: 'Caja de Patatas', category: 'Envases', currentStock: 300, unit: 'uds', minLevel: 50, status: 'In Stock' },
  { id: 'i19', name: 'Papel Albal (Hamburguesas/Bocadillos)', category: 'Envases', currentStock: 5, unit: 'rollos', minLevel: 2, status: 'In Stock' },
  { id: 'i20', name: 'Papel de Envolver (Hamburguesas/Bocadillos)', category: 'Envases', currentStock: 400, unit: 'uds', minLevel: 50, status: 'In Stock' },

  { id: 'i12', name: 'Salsa Arándanos', category: 'Salsas', currentStock: 20, unit: 'botes', minLevel: 5, status: 'In Stock' },
  { id: 'i13', name: 'Salsa Mojo Picón', category: 'Salsas', currentStock: 15, unit: 'botes', minLevel: 4, status: 'In Stock' },
  { id: 'i14', name: 'Salsa Baconesa', category: 'Salsas', currentStock: 25, unit: 'botes', minLevel: 5, status: 'In Stock' },
  { id: 'i15', name: 'Salsa Miel y Mostaza', category: 'Salsas', currentStock: 10, unit: 'botes', minLevel: 3, status: 'In Stock' },
  { id: 'i16', name: 'Envases de Salsa Pequeños', category: 'Envases', currentStock: 500, unit: 'uds', minLevel: 100, status: 'In Stock' },
  { id: 'i17', name: 'Envases de Salsa Grandes', category: 'Envases', currentStock: 300, unit: 'uds', minLevel: 50, status: 'In Stock' },
];

export const ORDERS: Order[] = [
  { id: '101', customer: 'Carlos M.', time: '12:45 PM', items: ['2x Pizza Margarita', '1x Cola Grande'], status: 'PENDIENTE', type: 'RECOGIDA', total: 18.50, paymentMethod: 'BIZUM', createdAt: Date.now() - 12 * 60000 },
  { id: '102', customer: 'Ana V.', time: '12:30 PM', items: ['1x Pasta Carbonara', '1x Ensalada Mixta'], status: 'PREPARANDO', type: 'MESA', table: '4', total: 15.00, paymentMethod: 'TARJETA', createdAt: Date.now() - 5 * 60000 },
  { id: '201', customer: 'Juan P.', time: '12:50 PM', items: ['1x Pizza Diavola', '2x Pan de Ajo'], status: 'PENDIENTE', type: 'DOMICILIO', total: 16.00, address: 'Calle Mayor 12', paymentMethod: 'EFECTIVO', createdAt: Date.now() - 2 * 60000 },
  { id: '301', customer: 'Marta G.', time: '12:15 PM', items: ['1x Hamburguesa Monster'], status: 'LISTO', type: 'DOMICILIO', total: 12.50, address: 'Av. Blasco 4', paymentMethod: 'PAYPAL', createdAt: Date.now() - 20 * 60000 }
];
