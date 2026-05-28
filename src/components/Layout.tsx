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
import { X, ArrowRight } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: UtensilsCrossed, label: 'Menú', roles: ['CLIENTE', 'JEFE', 'ENCARGADO', 'CAMARERO'] },
  { to: '/cart', icon: ShoppingCart, label: 'Crear Pedido', roles: ['CLIENTE', 'CAMARERO', 'ENCARGADO', 'JEFE'] },
  { to: '/kitchen', icon: Clock, label: 'Cocina', roles: ['COCINA', 'ENCARGADO', 'JEFE'] },
  { to: '/delivery', icon: Truck, label: 'Repartos', roles: ['REPARTIDOR', 'JEFE', 'ENCARGADO'] },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Panel', roles: ['ENCARGADO', 'JEFE'] },
  { to: '/orders', icon: ClipboardList, label: 'Pedidos', roles: ['ENCARGADO', 'JEFE', 'CAMARERO'] },
  { to: '/inventory', icon: Package, label: 'Inventario', roles: ['ENCARGADO', 'JEFE'] },
  { to: '/cms', icon: Crown, label: 'CMS', roles: ['JEFE'] },
  { to: '/settings', icon: Settings, label: 'Ajustes', roles: ['JEFE', 'ENCARGADO'] },
  { to: '/qr', icon: QrCode, label: 'QR Mesas', roles: ['JEFE', 'ENCARGADO'] },
  { to: '/clock', icon: Clock, label: 'Fichar', roles: ['COCINA', 'REPARTIDOR', 'ENCARGADO', 'CAMARERO'] },
  { to: '/profile', icon: UserCircle, label: 'Perfil', roles: ['CLIENTE', 'COCINA', 'REPARTIDOR', 'ENCARGADO', 'JEFE', 'CAMARERO'] },
];

const Logo = () => (
  <svg viewBox="0 0 200 150" className="w-16 h-12" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Arc - Red */}
    <path d="M 25 125 A 75 75 0 0 1 175 125" fill="none" stroke="#D62E2E" strokeWidth="10" strokeLinecap="round"/>
    {/* Inner Arc - Blue */}
    <path d="M 45 125 A 55 55 0 0 1 155 125" fill="none" stroke="#1D70B8" strokeWidth="8" strokeLinecap="round"/>
    
    {/* Pizza Slice */}
    <g transform="translate(100, 70) rotate(-10) scale(0.8)">
      {/* Pizza Base (Cheese) */}
      <path d="M -20 60 C -10 90 -20 100 -20 100 C -30 60 -5 70 -5 60 C -5 60 10 90 10 90 C 20 60 30 70 30 40 L 70 -50 L -60 -40 Z" fill="#F9CE1D" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Dripping Cheese Lines */}
      <path d="M -20 60 Q -15 85 -20 100 M -5 60 Q 5 85 10 90 M 20 60 Q 25 70 30 40" fill="none" stroke="#F9CE1D" strokeWidth="8" strokeLinecap="round" />
      
      {/* Crust */}
      <path d="M -70 -30 C -60 -70 50 -70 80 -40 L 65 -25 C 40 -50 -40 -45 -55 -20 Z" fill="#C78E3C" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M -70 -30 C -60 -70 50 -70 80 -40" fill="none" stroke="#D62E2E" strokeWidth="0"/>

      {/* Pepperoni */}
      <circle cx="-15" cy="-10" r="10" fill="#D62E2E" stroke="#000" strokeWidth="2"/>
      <circle cx="25" cy="-20" r="10" fill="#D62E2E" stroke="#000" strokeWidth="2"/>
      <circle cx="5" cy="15" r="10" fill="#D62E2E" stroke="#000" strokeWidth="2"/>
      <circle cx="-35" cy="-25" r="8" fill="#D62E2E" stroke="#000" strokeWidth="2"/>
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
                            
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.3);
                            
                            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                            
                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);
                            
                            oscillator.start();
                            oscillator.stop(audioCtx.currentTime + 0.3);
                        }
                    } catch(e) {
                        console.warn("Could not play notification sound", e);
                    }

                    if ('Notification' in window && Notification.permission === 'granted') {
                        const title = `Nuevo Pedido #${order.id}`;
                        const body = `${order.type}\nTotal: €${order.total.toFixed(2)}`;
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
    if (user?.verified && !user?.hasUsedWelcomeCoupon && !sessionStorage.getItem('welcomeToastShown')) {
      setShowWelcomeToast(true);
      sessionStorage.setItem('welcomeToastShown', 'true');
      const timer = setTimeout(() => setShowWelcomeToast(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const allowedNavItems = NAV_ITEMS.filter(item => item.roles.includes(role));
  const cartItemsCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  return (
    <div className="flex min-h-screen bg-surface-base text-white relative font-sans selection:bg-white selection:text-black">
      <AnimatePresence>
        {showWelcomeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-8 right-8 z-[100] max-w-sm"
          >
            <div className="bg-surface-container border border-white/10 p-5 rounded-2xl shadow-2xl flex items-start gap-4">
              <div className="flex-1 pr-6">
                <h4 className="font-medium text-white mb-1">Oferta de bienvenida activa</h4>
                <p className="text-sm text-gray-400">10% de descuento automático en caja.</p>
              </div>
              <button onClick={() => setShowWelcomeToast(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 sticky top-0 h-screen bg-surface-base">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4">
            <Logo />
            <div>
              <h1 className="text-xl font-display font-black text-brand-primary leading-none">MAMMA MIA!</h1>
              <p className="text-[10px] text-white tracking-[0.2em] font-sans opacity-80 mt-1">LA NOSTRA PIZZA</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                isActive 
                  ? "bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} strokeWidth={2.5} />
              <span className="flex-1">{item.label}</span>
              {item.to === '/inventory' && lowStockCount > 0 && (
                <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {lowStockCount}
                </span>
              )}
              {item.to === '/cart' && cartItemsCount > 0 && (
                <span className="bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <NavLink 
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm">
              {user ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || 'Invitado'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{role}</p>
            </div>
            <ArrowRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
          </NavLink>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-base/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-50">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          <MenuIcon size={20} />
        </button>
        <div className="flex items-center gap-3">
                <h1 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-primary">LA NOSTRA PIZZA</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
          {user ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="lg:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" 
             onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside 
               initial={{ x: '-100%' }}
               animate={{ x: 0 }}
               exit={{ x: '-100%' }}
               transition={{ type: "spring", bounce: 0, duration: 0.4 }}
               className="w-[80vw] max-w-sm h-full bg-surface-base border-r border-white/10 p-6 flex flex-col" 
               onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Logo />
                  <h1 className="text-xl font-display font-black text-brand-primary">MAMMA MIA!</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500"><X size={20}/></button>
              </div>
              <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                {allowedNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm",
                      isActive ? "bg-white text-black font-semibold" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <item.icon size={18} strokeWidth={2.5} />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface-base/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-40 pb-safe">
        {allowedNavItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1.5 p-2 transition-all duration-200",
              isActive ? "text-white" : "text-gray-600 hover:text-gray-300"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

