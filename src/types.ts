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
  image?: string;
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
  vapidKey?: string;
  vapidPrivateKey?: string;
}

export interface PushDeliveryStatus {
  id: string;
  userId: string;
  endpoint: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  timestamp: number;
}

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  openingHours: '12:00 - 16:00, 19:30 - 23:30',
  deliveryZones: ['Centro', 'Norte', 'Sur'],
  deliveryFee: 2.50,
  contactPhone: '+34 600 000 000',
  vapidKey: '',
  vapidPrivateKey: '',
};

export const MENU_ITEMS: MenuItem[] = [
  // PIZZAS
  { id: 'p1', name: 'Barbacoa', description: 'Tomate, mozzarella, bacon, cebolla y salsa barbacoa', price: 11.50, category: 'Pizzas', rating: 4.8, ratingCount: 124, isPopular: true },
  { id: 'p2', name: 'Carbonara', description: 'Nata, mozzarella, bacon, huevo y parmesano', price: 11.50, category: 'Pizzas', rating: 4.5, ratingCount: 89, isPopular: true },
  { id: 'p3', name: 'Búfalo', description: 'Tomate, mozzarella, carne picada, cebolla, pimiento rojo y salsa búfalo', price: 12.00, category: 'Pizzas', rating: 4.9, ratingCount: 201 },
  { id: 'p4', name: 'Colorado', description: 'Tomate, mozzarella, ternera, bacon, pimiento rojo', price: 12.50, category: 'Pizzas' },
  { id: 'p5', name: 'Canadá', description: 'Tomate, mozzarella, bacon, pollo, cebolla y mostaza', price: 12.00, category: 'Pizzas' },
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
  { id: 'h_deltoya', name: 'Deltoya', description: 'Donut de Pollo, Salsa De Queso, Salsa Mojo Picon, Triangulos Doritos, Torreznos y Brotes Tiernos', price: 13.90, category: 'Hamburguesas', isPopular: true },
  { id: 'h_black_bull', name: 'Black Bull', description: 'Toro de Lidia BBQ, Queso, Salsa Baconesa, Salsa Mayo Sriracha y Brotes Tiernos', price: 14.95, category: 'Hamburguesas', isPopular: true },

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
  { id: 'aros_cebolla_5_picantes', name: 'Aros de Cebolla (5 picantes)', description: '5 unidades de aros de cebolla con un toque crujiente y picante', price: 4.50, category: 'Aperitivos' },
  { id: 'aros_cebolla_7_normales', name: 'Aros de Cebolla (7 normales)', description: '7 unidades de crujientes y deliciosos aros de cebolla tradicionales', price: 5.00, category: 'Aperitivos' },

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
  { id: 'box1', name: 'Menú "The Box"', description: 'Pizza + Patatas + Aperitivo 1/2 Ración + Bebida', price: 13.50, category: 'Menús Especiales' },

  // BEBIDAS
  { id: 'c_cola_lata', name: 'Coca-Cola (Lata)', description: 'Lata de Coca-Cola original de 33cl', price: 2.00, category: 'Bebidas' },
  { id: 'c_cola_zero_lata', name: 'Coca-Cola Zero (Lata)', description: 'Lata de Coca-Cola Zero de 33cl', price: 2.00, category: 'Bebidas' },
  { id: 'fanta_nar_lata', name: 'Fanta Naranja (Lata)', description: 'Lata de Fanta Naranja de 33cl', price: 2.00, category: 'Bebidas' },
  { id: 'fanta_lim_lata', name: 'Fanta Limón (Lata)', description: 'Lata de Fanta Limón de 33cl', price: 2.00, category: 'Bebidas' },
  { id: 'sprite_lata', name: 'Sprite (Lata)', description: 'Lata de Sprite de 33cl', price: 2.00, category: 'Bebidas' },
  { id: 'aquarius_n', name: 'Aquarius Naranja', description: 'Refresco isotónico sabor naranja', price: 2.20, category: 'Bebidas' },
  { id: 'aquarius_l', name: 'Aquarius Limón', description: 'Refresco isotónico sabor limón', price: 2.20, category: 'Bebidas' },
  { id: 'cerveza', name: 'Cerveza (Lata)', description: 'Cerveza en lata de 33cl', price: 2.00, category: 'Bebidas' },
  { id: 'agua_peq', name: 'Agua Pequeña', description: 'Botella de agua de 500ml', price: 1.50, category: 'Bebidas' },
  { id: 'agua_grd', name: 'Agua Grande', description: 'Botella de agua de 1.5L', price: 2.50, category: 'Bebidas' },
  { id: 'litrona', name: 'Litrona de Cerveza', description: 'Botella familiar de cerveza de un litro', price: 3.50, category: 'Bebidas' },
  { id: 'vino_copas', name: 'Copa de Vino', description: 'Copa de vino de la casa', price: 2.50, category: 'Bebidas' },
  { id: 'cafes', name: 'Café', description: 'Taza de café recién hecho del día', price: 1.20, category: 'Bebidas' },
  { id: 'carajillo', name: 'Carajillo (Solo Mesa)', description: 'Café con licor quemado. Solo disponible para pedidos en mesa.', price: 2.00, category: 'Bebidas', tags: ['Solo Mesa'] },
  { id: 'cola_grande', name: 'Cola Grande (1L)', description: 'Botella de refresco de cola grande', price: 3.00, category: 'Bebidas' },

  // POSTRES
  { id: 'pistamisu', name: 'Pistamisu', description: 'Tiramisú de pistacho suave, cremoso y casero', price: 6.50, category: 'Postres', tags: ['Novedad'] },
  { id: 'cheescake_pantera_rosa', name: 'Cheesecake Pantera Rosa', description: 'Tarta de queso horneada con el nostálgico sabor de cobertura Pantera Rosa', price: 6.50, category: 'Postres', tags: ['Especial'] },
  { id: 'panacota_turron', name: 'Panacota de Turrón con Petazetas', description: 'Suave panna cotta de turrón tradicional que chispea en el paladar con petazetas', price: 6.00, category: 'Postres' },
  { id: 'bj_spectacu_love', name: "Spectacu-love (Ben & Jerry's)", description: "Helado de nata con crujientes tropezones de galleta caramelizada y finos remolinos de galleta caramelizada con canela", price: 7.50, category: 'Postres' },
  { id: 'bj_marshmallow', name: "Marshmallow & S'more (Ben & Jerry's)", description: "Helado de chocolate con tropezones de Cookie Dough al cacao y remolinos de nubes, cubierto de helado de nata y chips de chocolate", price: 7.90, category: 'Postres' },
  { id: 'bj_dulce', name: "Dulce-De-Lish (Ben & Jerry's)", description: "Helado de caramelo salado con trozos y remolinos de caramelo, cubierto de trozos de chocolate con sal marina", price: 7.90, category: 'Postres' },
  { id: 'bj_vermont_ster', name: "Cookie Vermont-ster (Ben & Jerry's)", description: "Helado de nata con cookies de chocolate y salsa de galleta al cacao", price: 7.90, category: 'Postres' },
  { id: 'bj_choco_lotta', name: "Choco-lotta Cheesecake (Ben & Jerry's)", description: "Helado de tarta de queso al cacao con trozos de chocolate con sal marina y galletas de cacao", price: 7.90, category: 'Postres' },
  { id: 'bj_cookie_dough', name: "Cookie Dough (Ben & Jerry's)", description: "Helado de vainilla con galletas y pepitas de chocolate", price: 7.50, category: 'Postres' },
  { id: 'bj_fudge_brownie', name: "Chocolate Fudge Brownie (Ben & Jerry's)", description: "Helado de chocolate súper cremoso con trozos jugosos de brownie", price: 7.50, category: 'Postres' },
  { id: 'bj_chunky_monkey', name: "Chunky Monkey (Ben & Jerry's)", description: "Helado de plátano con trozos de chocolate y nueces crujientes", price: 7.50, category: 'Postres' },
  { id: 'bj_strawberry', name: "Strawberry Cheesecake (Ben & Jerry's)", description: "Helado sabor tarta de queso con salsa de fresas y galleta graham", price: 7.50, category: 'Postres' },
  { id: 'bj_pecan_blondie', name: "Vanilla Pecan Blondie (Ben & Jerry's)", description: "Helado de vainilla con trozos de brownie rubio rubio y caramelo salado", price: 7.50, category: 'Postres' },
  { id: 'bj_caramel_brownie', name: "Caramel Brownie Party (Ben & Jerry's)", description: "Helado de caramelo intenso con trozos de brownie suave", price: 7.50, category: 'Postres' },
  { id: 'bj_peanut_butter_cup', name: "Peanut Butter Cup (Ben & Jerry's)", description: "Helado de crema de cacahuete con tazas de cacao y crema de cacahuete", price: 7.50, category: 'Postres' },
  { id: 'bj_half_baked', name: "Half Baked (Ben & Jerry's)", description: "Helado de chocolate y vainilla, trozos de brownie de chocolate y masa de galletas con pepitas de chocolate", price: 7.50, category: 'Postres' },
  { id: 'bj_vegan_brownie', name: "Chocolate Fudge Brownie Vegano (Ben & Jerry's)", description: "Nuestra mítica versión libre de lácteos e ingredientes veganos", price: 7.50, category: 'Postres', tags: ['Vegano'] },
  { id: 'bj_vegan_cookies', name: "Cookies on Cookie Dough Vegano (Ben & Jerry's)", description: "Helado vegano de caramelo con galletas crujientes y trozos chocolateados de masa", price: 7.50, category: 'Postres', tags: ['Vegano'] },
  { id: 'bj_netflix', name: "Netflix & Chilll'd (Ben & Jerry's)", description: "Helado de crema de cacahuete con remolinos de pretzel dulce y salado y tarta de chocolate", price: 7.50, category: 'Postres' }
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

  // BEBIDAS EN INVENTARIO
  { id: 'inv_c_cola_lata', name: 'Lata de Coca-Cola', category: 'Bebidas', currentStock: 300, unit: 'latas', minLevel: 50, status: 'In Stock' },
  { id: 'inv_c_cola_zero', name: 'Lata de Coca-Cola Zero', category: 'Bebidas', currentStock: 250, unit: 'latas', minLevel: 40, status: 'In Stock' },
  { id: 'inv_fanta_naranja', name: 'Lata de Fanta Naranja', category: 'Bebidas', currentStock: 200, unit: 'latas', minLevel: 30, status: 'In Stock' },
  { id: 'inv_fanta_limon', name: 'Lata de Fanta Limón', category: 'Bebidas', currentStock: 180, unit: 'latas', minLevel: 30, status: 'In Stock' },
  { id: 'inv_sprite_lata', name: 'Lata de Sprite', category: 'Bebidas', currentStock: 150, unit: 'latas', minLevel: 25, status: 'In Stock' },
  { id: 'inv_aquarius_naranja', name: 'Aquarius Naranja', category: 'Bebidas', currentStock: 120, unit: 'latas', minLevel: 20, status: 'In Stock' },
  { id: 'inv_aquarius_limon', name: 'Aquarius Limón', category: 'Bebidas', currentStock: 120, unit: 'latas', minLevel: 20, status: 'In Stock' },
  { id: 'inv_cerveza_lata', name: 'Lata de Cerveza', category: 'Bebidas', currentStock: 400, unit: 'latas', minLevel: 60, status: 'In Stock' },
  { id: 'inv_agua_peq', name: 'Botella Agua Pequeña', category: 'Bebidas', currentStock: 200, unit: 'uds', minLevel: 40, status: 'In Stock' },
  { id: 'inv_agua_grd', name: 'Botella Agua Grande', category: 'Bebidas', currentStock: 100, unit: 'uds', minLevel: 20, status: 'In Stock' },
  { id: 'inv_litrona', name: 'Litrona de Cerveza', category: 'Bebidas', currentStock: 150, unit: 'botellas', minLevel: 30, status: 'In Stock' },
  { id: 'inv_vino_copa', name: 'Vino Tinto/Blanco', category: 'Bebidas', currentStock: 40, unit: 'botellas', minLevel: 8, status: 'In Stock' },
  { id: 'inv_cafe_grano', name: 'Café de Grano', category: 'Bebidas', currentStock: 15, unit: 'kg', minLevel: 3, status: 'In Stock' },
  { id: 'inv_carajillo_licor', name: 'Licor Carajillo', category: 'Bebidas', currentStock: 10, unit: 'botellas', minLevel: 2, status: 'In Stock' },
  { id: 'inv_cola_grande_bt', name: 'Refresco Cola Grande 1L', category: 'Bebidas', currentStock: 100, unit: 'latas', minLevel: 20, status: 'In Stock' },

  // POSTRES EN INVENTARIO
  { id: 'inv_pistamisu', name: 'Pistamisu Ración', category: 'Postres', currentStock: 30, unit: 'uds', minLevel: 5, status: 'In Stock' },
  { id: 'inv_cheesecake_pr', name: 'Cheesecake Pantera Rosa Ración', category: 'Postres', currentStock: 25, unit: 'uds', minLevel: 5, status: 'In Stock' },
  { id: 'inv_panacota_turron', name: 'Panacota de Turrón Ración', category: 'Postres', currentStock: 20, unit: 'uds', minLevel: 5, status: 'In Stock' },
  { id: 'inv_bj_spectacu_love', name: "Helado B&J Spectacu-love 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_marshmallow', name: "Helado B&J Marshmallow & S'more 427ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_dulce', name: "Helado B&J Dulce-De-Lish 427ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_vermont_ster', name: "Helado B&J Cookie Vermont-ster 427ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_choco_lotta', name: "Helado B&J Choco-lotta 427ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_cookie_dough', name: "Helado B&J Cookie Dough 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_fudge_brownie', name: "Helado B&J Chocolate Fudge Brownie 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_chunky_monkey', name: "Helado B&J Chunky Monkey 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_strawberry', name: "Helado B&J Strawberry Cheesecake 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_pecan_blondie', name: "Helado B&J Vanilla Pecan Blondie 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_caramel_brownie', name: "Helado B&J Caramel Brownie Party 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_peanut_butter_cup', name: "Helado B&J Peanut Butter Cup 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_half_baked', name: "Helado B&J Half Baked 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_vegan_brownie', name: "Helado B&J Choc Fudge Brownie Vegano 465ml", category: 'Postres', currentStock: 12, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_vegan_cookies', name: "Helado B&J Cookies on CD Vegano 465ml", category: 'Postres', currentStock: 12, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },
  { id: 'inv_bj_netflix', name: "Helado B&J Netflix & Chilll'd 465ml", category: 'Postres', currentStock: 15, unit: 'tarrinas', minLevel: 3, status: 'In Stock' },

  // INGREDIENTES EXCLUSIVOS HAMBURGUESAS DELTOYA Y BLACK BULL
  { id: 'inv_donut_pollo', name: 'Donut de Pollo', category: 'Ingredientes', currentStock: 40, unit: 'uds', minLevel: 10, status: 'In Stock' },
  { id: 'inv_doritos', name: 'Triángulos Doritos', category: 'Ingredientes', currentStock: 10, unit: 'kg', minLevel: 2, status: 'In Stock' },
  { id: 'inv_torreznos', name: 'Torreznos', category: 'Ingredientes', currentStock: 15, unit: 'kg', minLevel: 3, status: 'In Stock' },
  { id: 'inv_toro_lidia', name: 'Toro de Lidia BBQ', category: 'Ingredientes', currentStock: 30, unit: 'uds', minLevel: 8, status: 'In Stock' },
  { id: 'inv_mayo_sriracha', name: 'Salsa Mayo Sriracha', category: 'Salsas', currentStock: 8, unit: 'botes', minLevel: 2, status: 'In Stock' },
  { id: 'inv_aro_cebolla_pic', name: 'Aros Cebolla Picante', category: 'Ingredientes', currentStock: 200, unit: 'uds', minLevel: 40, status: 'In Stock' },
  { id: 'inv_aro_cebolla_norm', name: 'Aros Cebolla Normales', category: 'Ingredientes', currentStock: 300, unit: 'uds', minLevel: 50, status: 'In Stock' }
];

export const ORDERS: Order[] = [
  { id: '101', customer: 'Carlos M.', time: '12:45 PM', items: ['2x Pizza Margarita', '1x Cola Grande'], status: 'PENDIENTE', type: 'RECOGIDA', total: 18.50, paymentMethod: 'BIZUM', createdAt: Date.now() - 12 * 60000 },
  { id: '102', customer: 'Ana V.', time: '12:30 PM', items: ['1x Pasta Carbonara', '1x Ensalada Mixta'], status: 'PREPARANDO', type: 'MESA', table: '4', total: 15.00, paymentMethod: 'TARJETA', createdAt: Date.now() - 5 * 60000 },
  { id: '201', customer: 'Juan P.', time: '12:50 PM', items: ['1x Pizza Diavola', '2x Pan de Ajo'], status: 'PENDIENTE', type: 'DOMICILIO', total: 16.00, address: 'Calle Mayor 12', paymentMethod: 'EFECTIVO', createdAt: Date.now() - 2 * 60000 },
  { id: '301', customer: 'Marta G.', time: '12:15 PM', items: ['1x Hamburguesa Monster'], status: 'LISTO', type: 'DOMICILIO', total: 12.50, address: 'Av. Blasco 4', paymentMethod: 'PAYPAL', createdAt: Date.now() - 20 * 60000 }
];

export function getProductImage(productName: string): string | undefined {
  const normalized = productName.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics: e.g. "Paté" -> "PATE"
    .replace(/[^A-Z0-9]/g, '');

  if (normalized.includes('PEPPERONI')) return '/FOTOS PRODUCTOS/PEPPERONI.jpg';
  if (normalized.includes('PESTOBURRATA') || normalized.includes('PESTOBURATA')) return '/FOTOS PRODUCTOS/PESTOBURRATA.jpg';
  if (normalized.includes('PISTAMISU')) return '/FOTOS PRODUCTOS/PISTAMISU.jpg';
  if (normalized.includes('PROSCIUTTOFUNGHI')) return '/FOTOS PRODUCTOS/PROSCIUTTOFUNGHI.jpg';
  if (normalized.includes('PROSCIUTTO')) return '/FOTOS PRODUCTOS/PROSCIUTTO.jpg';
  if (normalized.includes('RUBIA')) return '/FOTOS PRODUCTOS/RUBIA.jpg';
  if (normalized.includes('THEBOX')) return '/FOTOS PRODUCTOS/THEBOX.jpg';
  if (normalized.includes('VAINILLAPECAN') || normalized.includes('VANILLAPECAN')) return '/FOTOS PRODUCTOS/VAINILLAPECAN.jpg';
  if (normalized.includes('VEGETAL')) return '/FOTOS PRODUCTOS/VEGETAL.jpg';
  if (normalized.includes('XTREM')) return '/FOTOS PRODUCTOS/XTREM.jpg';
  if (normalized.includes('SPRITE')) return '/FOTOS PRODUCTOS/sprite.jpg';
  return undefined;
}
