import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Package, 
  ClipboardList, 
  UserCircle, 
  Clock, 
  Truck,
  ShoppingCart,
  Menu as MenuIcon,
  Crown,
  Settings,
  QrCode,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth, Role } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: UtensilsCrossed, label: 'Menú', roles: ['CLIENTE', 'JEFE', 'ENCARGADO', 'CAMARERO'] },
  { to: '/cart', icon: ShoppingCart, label: 'Crear Pedido', roles: ['CLIENTE', 'CAMARERO', 'ENCARGADO', 'JEFE'] },
  { to: '/kitchen', icon: Clock, label: 'Cocina', roles: ['COCINA', 'ENCARGADO', 'JEFE'] },
  { to: '/delivery', icon: Truck, label: 'Repartos', roles: ['REPARTIDOR', 'JEFE', 'ENCARGADO'] },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Panel', roles: ['ENCARGADO', 'JEFE'] },
  { to: '/orders', icon: ClipboardList, label: 'Pedidos', roles: ['ENCARGADO', 'JEFE', 'CAMARERO'] },
  { to: '/inventory', icon: Package, label: 'Inventario', roles: ['ENCARGADO', 'JEFE'] },
  { to: '/cms', icon: Crown, label: 'CMS Menú', roles: ['JEFE'] },
  { to: '/settings', icon: Settings, label: 'Ajustes', roles: ['JEFE', 'ENCARGADO'] },
  { to: '/qr', icon: QrCode, label: 'QR Mesas', roles: ['JEFE', 'ENCARGADO'] },
  { to: '/clock', icon: Clock, label: 'Fichar', roles: ['COCINA', 'REPARTIDOR', 'ENCARGADO', 'CAMARERO'] },
  { to: '/profile', icon: UserCircle, label: 'Perfil', roles: ['CLIENTE', 'COCINA', 'REPARTIDOR', 'ENCARGADO', 'JEFE', 'CAMARERO'] },
];

const Logo = () => (
  <svg viewBox="0 0 200 150" className="w-16 h-12" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Arc - Red */}
    <path d="M 25 125 A 75 75 0 0 1 175 125" fill="none" stroke="#ea3224" strokeWidth="10" strokeLinecap="round"/>
    {/* Inner Arc - Blue */}
    <path d="M 45 125 A 55 55 0 0 1 155 125" fill="none" stroke="#1c6ae4" strokeWidth="8" strokeLinecap="round"/>
    
    {/* Pizza Slice */}
    <g transform="translate(100, 70) rotate(-10) scale(0.8)">
      {/* Pizza Base (Cheese) */}
      <path d="M -20 60 C -10 90 -20 100 -20 100 C -30 60 -5 70 -5 60 C -5 60 10 90 10 90 C 20 60 30 70 30 40 L 70 -50 L -60 -40 Z" fill="#ffc107" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Dripping Cheese Lines */}
      <path d="M -20 60 Q -15 85 -20 100 M -5 60 Q 5 85 10 90 M 20 60 Q 25 70 30 40" fill="none" stroke="#ffc107" strokeWidth="8" strokeLinecap="round" />
      
      {/* Crust */}
      <path d="M -70 -30 C -60 -70 50 -70 80 -40 L 65 -25 C 40 -50 -40 -45 -55 -20 Z" fill="#d97706" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M -70 -30 C -60 -70 50 -70 80 -40" fill="none" stroke="#ea3224" strokeWidth="0"/>

      {/* Pepperoni */}
      <circle cx="-15" cy="-10" r="10" fill="#ea3224" stroke="#000" strokeWidth="2"/>
      <circle cx="25" cy="-20" r="10" fill="#ea3224" stroke="#000" strokeWidth="2"/>
      <circle cx="5" cy="15" r="10" fill="#ea3224" stroke="#000" strokeWidth="2"/>
      <circle cx="-35" cy="-25" r="8" fill="#ea3224" stroke="#000" strokeWidth="2"/>
    </g>
  </svg>
);

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { role, setRole, user, logout } = useAuth();
  const { inventory, cart, orders } = useStore();
  const [showWelcomeToast, setShowWelcomeToast] = React.useState(false);
  const prevOrdersLengthRef = React.useRef(orders?.length || 0);

  React.useEffect(() => {
    if (['JEFE', 'ENCARGADO', 'COCINA'].includes(role)) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [role]);

  React.useEffect(() => {
    if (orders && orders.length > prevOrdersLengthRef.current) {
        if (['JEFE', 'ENCARGADO', 'COCINA'].includes(role)) {
            const newOrdersCount = orders.length - prevOrdersLengthRef.current;
            for (let i = 0; i < newOrdersCount; i++) {
                const order = orders[i];
                if (order.status === 'PENDIENTE') {
                    // Play acoustic signal (beep)
                    try {
                        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                        if (AudioContextClass) {
                            const audioCtx = new AudioContextClass();
                            const oscillator = audioCtx.createOscillator();
                            const gainNode = audioCtx.createGain();
                            
                            // High pitched beep
                            oscillator.type = 'triangle';
                            oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
                            
                            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                            
                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);
                            
                            oscillator.start();
                            oscillator.stop(audioCtx.currentTime + 0.5);
                        }
                    } catch(e) {
                        console.warn("Could not play notification sound", e);
                    }

                    if ('Notification' in window && Notification.permission === 'granted') {
                        const title = `🧑‍🍳 Nuevo Pedido: #${order.id}`;
                        const body = `${order.type} - ${order.customer}\nArtículos: ${order.items.length}\n${order.table ? `Mesa: ${order.table}` : ''}\nTotal: €${order.total.toFixed(2)}`;
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.ready.then(registration => {
                                // @ts-ignore
                                registration.showNotification(title, { body, icon: '/icon.png' });
                            });
                        } else {
                            new Notification(title, { body });
                        }
                    }
                }
            }
        }
    }
    prevOrdersLengthRef.current = orders?.length || 0;
  }, [orders, role]);

  React.useEffect(() => {
    // Only show toast if user is eligible, hasn't used coupon yet, and we haven't dismissed it
    // Store in sessionStorage to show it just once per login session
    if (user?.verified && !user?.hasUsedWelcomeCoupon && !sessionStorage.getItem('welcomeToastShown')) {
      setShowWelcomeToast(true);
      sessionStorage.setItem('welcomeToastShown', 'true');
      
      const timer = setTimeout(() => setShowWelcomeToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const allowedNavItems = NAV_ITEMS.filter(item => item.roles.includes(role));
  const cartItemsCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  return (
    <div className="flex min-h-screen bg-surface-base text-white relative">
      {/* Welcome Toast */}
      <AnimatePresence>
        {showWelcomeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 md:right-10 z-[100] max-w-sm w-[90%] md:w-auto"
          >
            <div className="bg-brand-primary/20 backdrop-blur-xl border border-brand-primary p-4 rounded-2xl shadow-[0_0_40px_rgba(255,228,175,0.2)] flex items-start gap-4">
              <div className="bg-brand-primary text-black p-2 rounded-xl mt-1 shrink-0">
                <Package size={24} />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="font-display font-black text-brand-primary text-lg leading-tight mb-1">¡Bienvenido!</h4>
                <p className="text-sm font-bold text-white/90">Tienes un <span className="text-brand-primary font-black uppercase">10% de descuento</span> listo para usar en tu primer pedido.</p>
              </div>
              <button onClick={() => setShowWelcomeToast(false)} className="text-brand-primary/60 hover:text-brand-primary hover:bg-brand-primary/10 p-2 rounded-lg transition-all shrink-0">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 sticky top-0 h-screen bg-black/40 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Logo />
            <div>
              <h1 className="text-2xl font-display font-black text-white leading-none tracking-tight">Mamma Mia!</h1>
              <p className="text-[10px] text-brand-primary tracking-[0.2em] font-bold opacity-90 mt-1">LA NOSTRA PIZZA</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-brand-red text-white neon-glow-red scale-100 shadow-xl" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn("transition-transform duration-300 group-hover:scale-110")} />
              <span className="font-bold flex-1 tracking-wide">{item.label}</span>
              {item.to === '/inventory' && lowStockCount > 0 && (
                <span className="bg-brand-yellow text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {lowStockCount}
                </span>
              )}
              {item.to === '/cart' && cartItemsCount > 0 && (
                <span className="bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                  {cartItemsCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 overflow-hidden border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold">
              {user ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-sm font-bold">{user?.name || 'Invitado'}</p>
              <p className="text-xs text-brand-yellow font-black uppercase">{role}</p>
            </div>
          </div>
          {user ? (
            <button 
              onClick={() => logout()}
              className="w-full bg-white/5 hover:bg-brand-red/20 hover:text-brand-red text-gray-400 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Cerrar Sesión
            </button>
          ) : (
            <NavLink 
              to="/login"
              className="w-full bg-brand-primary text-black font-black py-2 gap-2 text-sm rounded-lg transition-colors flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <UserCircle size={18} /> Iniciar Sesión
            </NavLink>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-base border-b border-white/10 flex items-center justify-between px-6 z-50">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-brand-primary">
          <MenuIcon />
        </button>
        <div className="flex items-center gap-1 scale-75">
          <Logo />
          <h1 className="text-lg font-display font-bold text-brand-primary">Mamma Mia!</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-primary/20 overflow-hidden text-brand-primary flex items-center justify-center font-bold">
          {user ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-surface-container p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-8">
              <Logo />
              <div>
                <h1 className="text-xl font-display font-bold text-brand-primary leading-none">Mamma Mia!</h1>
                <p className="text-[9px] text-white tracking-[0.2em] font-sans opacity-80 mt-1">LA NOSTRA PIZZA</p>
              </div>
            </div>
            <nav className="space-y-2 flex-1">
              {allowedNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-4 px-4 py-3 rounded-lg transition-all",
                    isActive ? "bg-brand-red text-white" : "text-gray-400"
                  )}
                >
                  <item.icon size={24} />
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.to === '/inventory' && lowStockCount > 0 && (
                    <span className="bg-brand-yellow text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      {lowStockCount}
                    </span>
                  )}
                  {item.to === '/cart' && cartItemsCount > 0 && (
                    <span className="bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                      {cartItemsCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 overflow-hidden border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold">
                    {user ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{user?.name || 'Invitado'}</p>
                    <p className="text-xs text-brand-yellow font-black uppercase">{role}</p>
                  </div>
                </div>
                {user ? (
                  <button 
                    onClick={() => logout()}
                    className="text-gray-400 hover:text-brand-red p-2 rounded-lg"
                  >
                    Cerrar
                  </button>
                ) : (
                  <NavLink 
                    to="/login"
                    className="text-brand-primary font-bold text-sm"
                  >
                    Entrar
                  </NavLink>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-0 pt-16 lg:pt-0 pb-20 lg:pb-0 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-3xl border-t border-white/10 flex items-center justify-around px-2 z-40 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-2">
        {allowedNavItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300",
              isActive ? "text-brand-yellow -translate-y-2" : "text-gray-500 hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn("relative p-2 rounded-xl transition-all duration-300", isActive && "bg-brand-yellow/10")}>
                  <item.icon size={22} className={cn("transition-transform", isActive ? "scale-110" : "scale-100")} />
                  {item.to === '/inventory' && lowStockCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-brand-yellow text-black text-[10px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                      {lowStockCount}
                    </span>
                  )}
                  {item.to === '/cart' && cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-brand-red text-white text-[10px] w-4 h-4 flex items-center justify-center font-bold rounded-full shadow-lg">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
