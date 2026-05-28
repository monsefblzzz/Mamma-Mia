import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { cn } from './lib/utils';
import { Clock, UserCircle, Package, ShoppingCart, Phone, Check, Star, Settings, Search, Calendar, Wheat, Nut, Milk, Fish, Egg, Vegan, RotateCcw, Printer, UtensilsCrossed, Users, X, Fingerprint, ScanFace, Scan, Navigation, MapPin, ShoppingBag, Bot, Send, MessageSquare, Pizza, Home, AlertCircle, Download } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Order } from './types';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { CMS } from './pages/CMS';
import { ConfirmModal } from './components/ConfirmModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dbService } from './db/DatabaseService';
import { QRCodeSVG } from 'qrcode.react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { AddressAutocomplete } from './components/AddressAutocomplete';

import { AdminApp } from './pages/AdminApp';
import { TauletaApp } from './pages/TauletaApp';
import { AppCliente } from './pages/AppCliente';

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
    >
        {children}
    </motion.div>
);

const API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function DeckGlOverlay({ layers }: { layers: any[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (!map) return;
    const overlay = new GoogleMapsOverlay({ layers });
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, layers]);
  return null;
}

const Login = () => {
    const { login, getUserByPhone, user } = useAuth();
    const [phone, setPhone] = React.useState('');
    const [pin, setPin] = React.useState('');
    const [name, setName] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    // SMS Verification State
    const [showSmsVerification, setShowSmsVerification] = React.useState(false);
    const [smsCode, setSmsCode] = React.useState('');
    const [expectedSmsCode, setExpectedSmsCode] = React.useState('');

    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const isNewUser = phone.length >= 6 && !getUserByPhone(phone);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let existingUser = getUserByPhone(phone);
        
        if (pin !== '1234') {
            alert('PIN incorrecto (Usa 1234 para probar)');
            return;
        }

        const isTestAccount = ['000000000', '600333444', '600555666', '600777888'].includes(phone);

        // Required verification flow for new users or existing unverified accounts
        if (!isTestAccount && (!existingUser || !existingUser.verified)) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setExpectedSmsCode(code);
            alert(`[SIMULACIÓN DE SMS]\nEnviado a: ${phone}\n\nTu código de verificación para Mamma Mia Nules es: ${code}`);
            setShowSmsVerification(true);
            return;
        }

        doLogin();
    };

    const doLogin = async () => {
        setLoading(true);
        try {
            await login(phone, pin, name, address);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySms = async (e: React.FormEvent) => {
        e.preventDefault();
        if (smsCode === expectedSmsCode) {
            await doLogin();
            alert('¡Cuenta verificada!\nHas desbloqueado un cupón de bienvenida del 10% de descuento para automático tu primer pedido.');
        } else {
            alert('Código SMS incorrecto. Por favor, inténtalo de nuevo.');
        }
    };

    if (showSmsVerification) {
        return (
            <div className="min-h-screen bg-surface-base flex items-center justify-center p-6 text-white relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px]"></div>
                <div className="w-full max-w-md bg-surface-container/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                        <Phone className="w-16 h-16 mx-auto mb-4 text-brand-primary opacity-80" />
                        <h1 className="text-3xl font-display font-black tracking-tight mb-2">Verifica tu Tlf</h1>
                        <p className="text-gray-400 font-medium">Hemos mandado un SMS simulado al {phone}</p>
                    </div>

                    <form onSubmit={handleVerifySms} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Código SMS</label>
                            <input 
                                type="text" 
                                value={smsCode}
                                onChange={e => setSmsCode(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-center text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary transition-all font-medium tracking-[0.5em] text-2xl"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,228,175,0.2)] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? 'Verificando...' : 'Confirmar Código'}
                        </button>
                        
                        <div className="text-center mt-4">
                            <button 
                                type="button" 
                                onClick={() => setShowSmsVerification(false)} 
                                className="text-xs text-gray-400 hover:text-white font-bold transition-colors"
                            >
                                Cambiar número de teléfono
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center p-6 text-white relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[100px]"></div>
            
            <div className="w-full max-w-md bg-surface-container/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <svg viewBox="0 0 200 150" className="w-24 h-16 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 20 120 A 80 80 0 0 1 180 120" fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round"/>
                        <path d="M 35 120 A 65 65 0 0 1 165 120" fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round"/>
                        <g transform="translate(100, 60) rotate(15) scale(0.6)">
                        <path d="M -80 -80 L 80 -40 L 0 60 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="4" strokeLinejoin="round"/>
                        <path d="M -80 -80 C -40 -100 40 -80 80 -40 L -80 -80" fill="#f59e0b" stroke="#d97706" strokeWidth="12" strokeLinecap="round"/>
                        <circle cx="-30" cy="-30" r="12" fill="#dc2626" />
                        <circle cx="20" cy="-10" r="12" fill="#dc2626" />
                        <circle cx="-10" cy="15" r="12" fill="#dc2626" />
                        <path d="M -40 20 C -40 50 -20 70 0 60 C 20 50 10 30 20 10" fill="#fbbf24" stroke="#d97706" strokeWidth="4"/>
                        </g>
                    </svg>
                    <h1 className="text-3xl font-display font-black tracking-tight mb-2">Bienvenido</h1>
                    <p className="text-gray-400 font-medium">Inicia sesión o crea tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary transition-all font-medium"
                                placeholder="600 000 000"
                                required
                            />
                        </div>
                    </div>
                    
                    {isNewUser && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-brand-yellow ml-2">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-brand-yellow/30 rounded-2xl py-4 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-yellow transition-all font-medium"
                                    placeholder="Tu nombre (nuevo usuario)"
                                    required={isNewUser}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-brand-yellow ml-2">Dirección de Entrega</label>
                                <input 
                                    type="text" 
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full bg-black/40 border border-brand-yellow/30 rounded-2xl py-4 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-yellow transition-all font-medium"
                                    placeholder="Calle, Número..."
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">PIN / Contraseña</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary transition-all font-medium tracking-[0.2em]"
                                placeholder="••••"
                                maxLength={4}
                                required
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 text-center mt-2">PIN de prueba: 1234 {isNewUser ? '(creado para esta cuenta)' : ''}</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,228,175,0.2)] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Accediendo...' : (isNewUser ? 'Crear Cuenta y Entrar' : 'Entrar')}
                    </button>
                    
                    <div className="flex flex-col gap-2 mt-6 border-t border-white/5 pt-4">
                        <button type="button" onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-white font-bold transition-colors mb-2">
                            ← Volver al Menú sin registro
                        </button>
                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">Cuentas de prueba:</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-4 rounded-xl border border-white/5 text-gray-400">
                            <div><span className="font-black text-white">Jefe:</span> 000000000</div>
                            <div><span className="font-black text-white">Camarero:</span> 600333444</div>
                            <div><span className="font-black text-white">Cocina:</span> 600555666</div>
                            <div><span className="font-black text-white">Reparto:</span> 600777888</div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StarRating = ({ 
  rating = 0, 
  ratingCount = 0,
  onRate,
}: {
  rating?: number;
  ratingCount?: number;
  onRate: (rating: number) => void;
}) => {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const displayRating = rating.toFixed(1);

  return (
    <div className="flex flex-col gap-1 items-end mt-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hovered !== null && star <= hovered) || (hovered === null && star <= Math.round(rating));
          return (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                onRate(star);
              }}
              className="focus:outline-none transition-transform hover:scale-125"
            >
              <Star
                size={16}
                className={cn(
                  "transition-colors",
                  isFilled ? "fill-brand-yellow text-brand-yellow" : "text-gray-600 hover:text-gray-400"
                )}
              />
            </button>
          );
        })}
      </div>
      {(ratingCount > 0) && (
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          {displayRating} ({ratingCount} {ratingCount === 1 ? 'val' : 'val.'})
        </span>
      )}
    </div>
  );
};

const AllergyIcons = ({ info }: { info: string }) => {
  if (!info) return null;
  const lowercase = info.toLowerCase();
  
  const tags = [];
  if (lowercase.includes('gluten') || lowercase.includes('trigo')) tags.push({ Icon: Wheat, title: 'Gluten' });
  if (lowercase.includes('frutos secos') || lowercase.includes('nuez') || lowercase.includes('cacahuete')) tags.push({ Icon: Nut, title: 'Frutos secos' });
  if (lowercase.includes('lactosa') || lowercase.includes('leche') || lowercase.includes('queso')) tags.push({ Icon: Milk, title: 'Lácteos' });
  if (lowercase.includes('pescado') || lowercase.includes('atún') || lowercase.includes('marisco')) tags.push({ Icon: Fish, title: 'Pescado/Marisco' });
  if (lowercase.includes('huevo')) tags.push({ Icon: Egg, title: 'Huevo' });
  if (lowercase.includes('vegan')) tags.push({ Icon: Vegan, title: 'Vegano' });

  if (tags.length === 0) return <div className="text-[10px] text-gray-500 max-w-[80px] truncate" title={info}>{info}</div>;

  return (
    <div className="flex gap-1.5 items-center bg-white/5 py-1 px-2 rounded-lg border border-white/10" title={info}>
      {tags.map((t, i) => (
        <t.Icon key={i} size={14} className="text-gray-400 hover:text-brand-yellow transition-colors cursor-help" />
      ))}
    </div>
  );
};

const MenuItemCard = ({ 
  item, 
  selectedItem, 
  setSelectedItem, 
  updateMenuItem, 
  rateMenuItem, 
  handleAddToCart, 
  addedItem, 
  badges 
}: any) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div 
      ref={ref}
      onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
      className="bg-surface-container rounded-3xl overflow-hidden border border-white/5 hover:border-brand-primary/50 transition-all duration-300 ease-out group flex flex-col cursor-pointer hover:shadow-[0_8px_30px_rgba(249,206,29,0.12)] hover:-translate-y-1 hover:scale-[1.02]"
    >
      <div className="h-48 bg-black relative overflow-hidden">
         {item.image ? (
            <motion.img 
              style={{ y }}
              src={item.image} 
              alt={item.name} 
              className="w-full h-[120%] object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 absolute top-[-10%] left-0 right-0" 
            />
         ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-surface-container-high pattern-diagonal-lines pattern-white/5 pattern-size-4">
               <span className="text-xs font-display font-black uppercase tracking-widest opacity-50">Mamma Mia!</span>
            </div>
         )}
         
         <button 
           onClick={(e) => {
             e.stopPropagation();
             updateMenuItem(item.id, { ...item, isPopular: !item.isPopular });
           }}
           className={cn(
             "absolute top-4 right-4 p-2.5 rounded-full border shadow-xl flex items-center gap-1 transition-all",
             item.isPopular ? "bg-brand-red text-white border-brand-red" : "bg-black/40 text-gray-400 border-white/10 hover:bg-black/80 hover:text-white"
           )}
         >
           <Star size={14} fill={item.isPopular ? "currentColor" : "none"} />
         </button>
      </div>
      
      <div className="p-5 flex-1 flex flex-col relative z-20 bg-surface-container">
          <div className="flex justify-between items-start mb-1 gap-4">
            <h4 className="text-lg font-display font-bold text-white group-hover:text-brand-primary transition-colors leading-tight">{item.name}</h4>
          </div>
          <p className="text-xs text-gray-400 font-sans mb-3 flex-1 leading-relaxed line-clamp-2">
            {item.description}
          </p>
          <div className="flex justify-between items-center mb-4">
             <span className="text-lg font-display font-bold text-brand-primary">€{item.price.toFixed(2)}</span>
             <div className="flex flex-col items-end gap-2 shrink-0">
                <AllergyIcons info={item.allergy_info} />
             </div>
          </div>
          
          {selectedItem?.id === item.id && (
            <div className="mb-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
              {item.allergy_info && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                   <h5 className="font-mono text-gray-400 uppercase tracking-widest text-[10px] mb-2 text-white">Allergy Info</h5>
                   <p className="text-xs text-gray-300">{item.allergy_info}</p>
                </div>
              )}
              {item.recipe && (item.recipe.ingredients.length > 0 || item.recipe.steps.length > 0) && (
                <div className="bg-surface-container-high rounded-2xl border border-white/10 p-4">
                   <h5 className="font-mono text-white uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                     <UtensilsCrossed size={12} />
                     Recipe Details
                   </h5>
                   {item.recipe.ingredients.length > 0 && (
                     <div className="mb-4">
                       <h6 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Ingredients</h6>
                       <div className="flex flex-wrap gap-2">
                         {item.recipe.ingredients.map((ing: string, i: number) => (
                           <span key={i} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">
                             {ing}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                   {item.recipe.steps.length > 0 && (
                     <div>
                       <h6 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Preparation</h6>
                       <ol className="space-y-2">
                         {item.recipe.steps.map((step: string, i: number) => (
                           <li key={i} className="text-xs text-gray-300 flex gap-2">
                             <span className="text-white font-bold shrink-0">{i + 1}.</span>
                             <span>{step}</span>
                           </li>
                         ))}
                       </ol>
                     </div>
                   )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-end mt-auto border-t border-white/5 pt-5">
            <div className="flex flex-wrap gap-2 max-w-[70%]">
              <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-1 rounded text-gray-400">
                {item.category}
              </span>
              {item.tags?.slice(0, 2).map((tag: string) => (
                <span key={tag} className="text-[10px] font-mono uppercase bg-white/10 text-white px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="relative">
              {badges.filter((b: any) => b.itemId === item.id).map((b: any) => (
                 <motion.div 
                   key={b.id}
                   initial={{ opacity: 0, y: 10, scale: 0.8 }}
                   animate={{ opacity: 1, y: -40, scale: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute bottom-12 right-0 text-white font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs shadow-xl border border-white/20 pointer-events-none"
                 >
                   Added
                 </motion.div>
              ))}
              <button 
                onClick={(e) => handleAddToCart(e, item)}
                title="Añadir al pedido"
                className={cn(
                  "h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center transition-all duration-300 border relative z-10",
                  addedItem === item.id 
                    ? "bg-white text-black border-white scale-105" 
                    : "bg-transparent text-gray-400 hover:text-white border-white/20 hover:border-white hover:bg-white/10 active:scale-95"
                )}>
                {addedItem === item.id ? <Check size={18} /> : <ShoppingCart size={18} />}
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

const ChatWidget = ({ menuItems }: { menuItems: any[] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{ text: string, isUser: boolean, isSystem?: boolean }[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { addToCart } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          preferences: userMessage, 
          menuData: menuItems.map(m => ({ name: m.name, desc: m.description, category: m.category, price: m.price, tags: m.tags, allergy: m.allergy_info })) 
        }),
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { text: data.reply || data.error || 'Lo siento, hubo un error de conexión.', isUser: false }]);
      
      if (data.order && (data.order.pizzas?.length > 0 || data.order.bebidas?.length > 0 || data.order.otros?.length > 0)) {
        let addedCount = 0;
        const processGroup = (group: any[]) => {
            if(!group) return;
            group.forEach(i => {
               const matched = menuItems.find(m => m.name.toLowerCase().includes(i.name.toLowerCase()));
               if (matched) {
                   addToCart(matched, i.qty || 1, i.notes || '');
                   addedCount++;
               }
            });
        };
        processGroup(data.order.pizzas);
        processGroup(data.order.bebidas);
        processGroup(data.order.otros);

        if (addedCount > 0) {
           setMessages(prev => [...prev, { text: `✅ Se han añadido ${addedCount} productos a tu carrito.`, isUser: false, isSystem: true }]);
        }
      }

    } catch (e) {
      setMessages(prev => [...prev, { text: 'No pude conectarme al servidor.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-[350px] shadow-2xl rounded-2xl overflow-hidden bg-surface-container border border-white/10 flex flex-col"
          >
            <div className="bg-brand-primary p-4 text-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <span className="font-bold text-lg leading-none pt-1 uppercase tracking-tight">Chef AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-black/70 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-surface-container/50">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-8 space-y-2">
                  <p>¡Hola! Puedo añadir platos o modificar los que pidas.</p>
                  <p>Ej: "Añade una pizza barbacoa, pero la mitad que sea cuatro quesos".</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                      m.isSystem ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/30' :
                      m.isUser ? 'bg-brand-secondary text-black rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'
                    }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white rounded-xl rounded-bl-none px-4 py-2 text-sm flex gap-1 items-center h-9">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-surface-container border-t border-white/10">
               <div className="flex items-center gap-2">
                 <input 
                   type="text" 
                   value={input}
                   onChange={e => setInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSend()}
                   placeholder="Ej: Quiero una pizza..."
                   className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary placeholder-gray-500"
                 />
                 <button 
                   onClick={handleSend}
                   disabled={isLoading || !input.trim()}
                   className="bg-brand-primary text-black p-2.5 rounded-xl hover:bg-brand-yellow disabled:opacity-50 transition-colors"
                 >
                   <Send className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-primary text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,228,175,0.4)] hover:scale-110 active:scale-95 transition-all"
      >
        <MessageSquare className="w-7 h-7" />
      </button>
    </div>
  );
};

// Lazy load pages for better performance
const Menu = () => {
  const { menuItems, categories, addToCart, rateMenuItem, updateMenuItem, cart } = useStore();
  const navigate = useNavigate();
  const [addedItem, setAddedItem] = React.useState<string | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [badges, setBadges] = React.useState<{id: number, itemId: string}[]>([]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortByPopular, setSortByPopular] = React.useState(false);
  const [activeDietFilters, setActiveDietFilters] = React.useState<string[]>([]);
  
  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    addToCart(item);
    setAddedItem(item.id);
    
    const badgeId = Date.now();
    setBadges(prev => [...prev, { id: badgeId, itemId: item.id }]);
    setTimeout(() => {
      setBadges(prev => prev.filter(b => b.id !== badgeId));
    }, 1000);
    
    setToastMessage(`¡${item.name} añadido al pedido!`);

    setTimeout(() => {
        setAddedItem(null);
        setToastMessage(null);
    }, 2000); // clear after 2s
  };

  return (
  <div className="space-y-12 relative w-full">
    <div className="relative rounded-[2rem] overflow-hidden h-[24rem] md:h-[32rem] border border-white/5 group bg-surface-container flex items-center shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container/60 to-transparent z-10 p-8 md:p-16 flex flex-col justify-center w-full md:w-2/3 lg:w-1/2">
        <h3 className="text-xs font-mono text-brand-blue uppercase tracking-[0.3em] font-semibold mb-4">LA NOSTRA PIZZA</h3>
        <h2 className="text-5xl md:text-7xl font-display text-brand-primary font-black mb-6 tracking-tighter leading-[1.1]">
          Mamma Mia!
        </h2>
        <p className="text-sm md:text-base text-gray-400 font-bold leading-relaxed max-w-sm mb-8">
          Auténtica pizza, hamburguesas brutales y los mejores entrantes. Descubre el sabor de Nules.
        </p>
        <div className="flex items-center gap-4">
          <button onClick={() => window.scrollTo({top: 500, behavior: 'smooth'})} className="px-6 py-3 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
            View Menu
          </button>
        </div>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-surface-container/40 to-surface-container z-10" />
        <img 
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-50 contrast-125 saturate-50 group-hover:scale-105 transition-transform duration-[2s] ease-out" 
          alt="Refined culinary presentation" 
        />
      </div>
    </div>

    {/* Search Input & Controls */}
    <div className="relative max-w-3xl mx-auto -mt-6 z-20 flex flex-col gap-6 items-center">
       <div className="relative w-full">
         <input 
            type="text"
            placeholder="Buscar en la carta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-base border border-brand-primary text-white rounded-full py-4 pl-14 pr-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder-gray-500 font-bold transition-all text-lg"
         />
         <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary">
            <Pizza size={24} />
         </span>
       </div>
       
       <div className="flex gap-3 overflow-x-auto w-full pb-2 hide-scrollbar snap-x px-2 max-w-full">
          <button
              onClick={() => setActiveCategory('TODAS')}
              className={cn(
                  "snap-center shrink-0 px-6 py-2.5 rounded-full font-bold text-sm tracking-wider uppercase transition-all whitespace-nowrap",
                  activeCategory === 'TODAS' 
                      ? "bg-brand-primary text-surface-base" 
                      : "bg-surface-container text-white hover:bg-surface-container-high border border-white/5"
              )}
          >
              Todas
          </button>
          {categories.map(cat => (
              <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                      "snap-center shrink-0 px-6 py-2.5 rounded-full font-bold text-sm tracking-wider uppercase transition-all whitespace-nowrap",
                      activeCategory === cat 
                          ? "bg-brand-primary text-surface-base" 
                          : "bg-surface-container text-white hover:bg-surface-container-high border border-white/5"
                  )}
              >
                  {cat}
              </button>
          ))}
       </div>
    </div>

    {/* Dietary Filters */}
    <div className="max-w-3xl mx-auto flex flex-wrap gap-3 justify-center">
      {['Vegetariano', 'Vegano', 'Sin Gluten'].map(filter => {
         const isActive = activeDietFilters.includes(filter);
         return (
           <button
             key={filter}
             onClick={() => {
                setActiveDietFilters(prev => 
                  prev.includes(filter) 
                    ? prev.filter(f => f !== filter)
                    : [...prev, filter]
                );
             }}
             className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300 flex items-center gap-2 ${
               isActive 
                 ? 'bg-brand-secondary border-brand-secondary text-black shadow-[0_0_20px_rgba(255,165,0,0.3)]' 
                 : 'bg-surface-container border-white/20 text-gray-400 hover:border-brand-primary/50'
             }`}
           >
             {filter === 'Vegetariano' && <span className="text-sm">🥗</span>}
             {filter === 'Vegano' && <span className="text-sm">🌱</span>}
             {filter === 'Sin Gluten' && <span className="text-sm">🌾</span>}
             {filter}
           </button>
         );
      })}
    </div>

    {categories.map(category => {
      if (activeCategory !== 'TODAS' && activeCategory !== category) return null;
      let categoryItems = menuItems.filter(item => {
         const matchesCategory = item.category === category;
         if (!matchesCategory) return false;
         
         const normalizedSearch = searchTerm?.toLowerCase() || '';
         const matchesSearch = !normalizedSearch || (
                               item.name.toLowerCase().includes(normalizedSearch) || 
                               item.description.toLowerCase().includes(normalizedSearch) ||
                               item.category.toLowerCase().includes(normalizedSearch) ||
                               (item.tags && item.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))) ||
                               (item.allergy_info && item.allergy_info.toLowerCase().includes(normalizedSearch)));

         const matchesDiet = activeDietFilters.length === 0 || activeDietFilters.every(filter => {
           const map: Record<string, string[]> = {
             'Vegetariano': ['vegetal', 'vegetariana', 'vegetariano', 'margarita', 'ensalada', 'queso', 'patatas', '4 quesos', 'espinacas'],
             'Vegano': ['vegano', 'vegana', 'vegetal', 'patatas', 'ensalada'],
             'Sin Gluten': ['sin gluten', 'ensalada', 'patatas']
           };
           const keywords = map[filter] || [];
           return keywords.some(k => 
             item.name.toLowerCase().includes(k) || 
             item.description.toLowerCase().includes(k) ||
             (item.tags && item.tags.some(tag => tag.toLowerCase().includes(k)))
           );
         });

         return matchesSearch && matchesDiet;
      });
      
      if (categoryItems.length === 0) return null;
      
      if (sortByPopular) {
        categoryItems.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      }
      
      return (
        <section key={category} className="scroll-m-24" id={category.replace(/\s+/g, '-').toLowerCase()}>
          {activeCategory === 'TODAS' && (
              <h3 className="text-3xl font-black text-brand-primary border-b border-white/10 pb-4 mb-8 flex items-center gap-4">
                <span className="bg-brand-red w-3 h-10 rounded-full inline-block"></span>
                {category}
              </h3>
          )}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {categoryItems.map((item) => (
              <motion.div 
                key={item.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 20 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
              >
                <MenuItemCard
                  item={item}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  updateMenuItem={updateMenuItem}
                  rateMenuItem={rateMenuItem}
                  handleAddToCart={handleAddToCart}
                  addedItem={addedItem}
                  badges={badges}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      );
    })}

    {menuItems.filter(item => {
        const normalizedSearch = searchTerm?.toLowerCase() || '';
        if (!normalizedSearch && activeCategory === 'TODAS') return false; 
        
        const matchesSearch = !normalizedSearch || (
               item.name.toLowerCase().includes(normalizedSearch) || 
               item.description.toLowerCase().includes(normalizedSearch) ||
               item.category.toLowerCase().includes(normalizedSearch) ||
               (item.tags && item.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))) ||
               (item.allergy_info && item.allergy_info.toLowerCase().includes(normalizedSearch)));

        const matchesDiet = activeDietFilters.length === 0 || activeDietFilters.every(filter => {
          const map: Record<string, string[]> = {
            'Vegetariano': ['vegetal', 'vegetariana', 'vegetariano', 'margarita', 'ensalada', 'queso', 'patatas', '4 quesos', 'espinacas'],
            'Vegano': ['vegano', 'vegana', 'vegetal', 'patatas', 'ensalada'],
            'Sin Gluten': ['sin gluten', 'ensalada', 'patatas']
          };
          const keywords = map[filter] || [];
          return keywords.some(k => 
            item.name.toLowerCase().includes(k) || 
            item.description.toLowerCase().includes(k) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(k)))
          );
        });

        return matchesSearch && matchesDiet;
     }).length === 0 && (
       <div className="text-center py-20 opacity-50 relative z-20">
         <Package size={64} className="mx-auto mb-6 text-brand-primary" />
         <h3 className="text-2xl font-bold text-white mb-2">No se han encontrado platos</h3>
         <p className="text-gray-400 max-w-md mx-auto">Vaya, parece que no hemos encontrado opciones con estas opciones. Intenta buscar otra cosa diferente.</p>
       </div>
    )}
    <ChatWidget menuItems={menuItems} />
    
    <AnimatePresence>
      {toastMessage && (
         <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-brand-primary text-black px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(249,206,29,0.3)] border border-white/20 flex items-center gap-3 whitespace-nowrap font-bold"
         >
            <Check size={18} className="text-black" />
            {toastMessage}
         </motion.div>
      )}
    </AnimatePresence>

    {/* Bottom Mobile Tab Bar (App-style) */}
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-surface-container-high/90 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden">
         <div className="flex justify-between items-center px-6 py-2 relative h-[72px]">
            <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-1 text-brand-primary relative z-10 w-16">
               <Home size={24} className="stroke-[2px]" />
               <span className="text-[10px] font-black tracking-widest uppercase mt-1">Inicio</span>
            </button>
            <button onClick={() => document.querySelector('input')?.focus()} className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white transition-colors relative z-10 w-16 -ml-4">
               <Search size={22} className="stroke-[2px]" />
               <span className="text-[10px] font-bold tracking-widest uppercase mt-1">Buscar</span>
            </button>
            
            <div className="w-20 absolute left-1/2 -translate-x-1/2 -top-6 flex justify-center z-20">
               <button 
                  onClick={() => navigate('/cart')} 
                  className={cn(
                     "w-16 h-16 rounded-full bg-surface-container text-gray-400 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative transition-transform active:scale-95 border-4 border-surface-container-high",
                     cart.length > 0 ? "scale-110 bg-brand-blue text-white shadow-[0_8px_30px_rgba(29,112,184,0.4)]" : "hover:text-white"
                  )}
               >
                  <ShoppingCart size={24} className="stroke-[2.5px] ml-[-2px]" />
                  {cart.length > 0 && (
                     <span className="absolute -top-1 -right-1 bg-brand-primary text-black w-6 h-6 flex items-center justify-center rounded-full font-black text-xs border-2 border-surface-container-high">
                        {cart.length}
                     </span>
                  )}
               </button>
            </div>
            
            <button className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white transition-colors relative z-10 w-16 invisible" aria-hidden>
               {/* Spacer for center button */}
            </button>
            
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white transition-colors relative z-10 w-16 -mr-4">
               <UserCircle size={22} className="stroke-[2px]" />
               <span className="text-[10px] font-bold tracking-widest uppercase mt-1">Perfil</span>
            </button>
         </div>
    </div>
    
    <AnimatePresence>
      {cart.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-0 right-0 z-[60] justify-center px-4 pointer-events-none hidden md:flex"
        >
           <button 
             onClick={() => navigate('/cart')} 
             className="pointer-events-auto w-full max-w-[340px] bg-brand-primary text-[#1A1A1A] uppercase tracking-[0.2em] font-black py-4 rounded-full shadow-[0_10px_40px_rgba(249,206,29,0.3)] hover:scale-105 active:scale-95 transition-all text-center flex flex-col items-center justify-center border border-brand-primary/50"
           >
             <span className="text-lg">PEDIR AHORA</span>
             <span className="text-[10px] opacity-75 mt-0.5 font-bold">({cart.length} productos)</span>
           </button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)};

const Dashboard = () => {
  const { orders, inventory } = useStore();
  const { role, users, user } = useAuth();
  const navigate = useNavigate();
  const [showImporter, setShowImporter] = React.useState(false);
  const [daysRange, setDaysRange] = React.useState(7);
  const todayOrders = orders; // assuming all orders are today for this demo

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minLevel);

  const revenueChartData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    
    // Create a map of date strings to totals
    const ordersByDate = orders.reduce((acc, obj) => {
      // try to use order.date, otherwise fallback to today
      const dateStr = obj.date || today.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + obj.total;
      return acc;
    }, {} as Record<string, number>);

    for (let i = daysRange - 1; i >= 0; i--) {
       const d = new Date(today);
       d.setDate(d.getDate() - i);
       const dateStr = d.toISOString().split('T')[0];
       data.push({
         name: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
         total: ordersByDate[dateStr] || 0
       });
    }
    // To make it look good for preview if no DB orders exist yet
    const hasData = data.some(d => d.total > 0);
    if (!hasData) {
       return data.map((d, i) => ({
          name: d.name,
          total: Math.floor(Math.random() * 500) + 300 + (i * 50)
       }));
    }
    return data;
  }, [orders, daysRange]);
  
  const customers = users.filter(u => u.role === 'CLIENTE');
  const revenue = todayOrders.reduce((acc, o) => acc + o.total, 0);
  const activeOrders = todayOrders.filter(o => o.status !== 'COMPLETADO').length;
  const pendingOrders = todayOrders.filter(o => o.status === 'PENDIENTE' || o.status === 'PREPARANDO').length;

  // Calculate zone stats based on customer addresses
  const topZones = customers.reduce((acc, c) => {
    if (c.address) {
        const zoneMatch = c.address.match(/(Nules|Villavieja|Vilavella|Moncofar|Playa|Artana)/i);
        const zone = zoneMatch ? zoneMatch[0].toUpperCase() : 'NULES';
        acc[zone] = (acc[zone] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topZone = Object.entries(topZones).sort(([, aCount], [, bCount]) => (bCount as number) - (aCount as number))[0]?.[0] || 'NULES';

  // Density heatmap based on CRM zones
  const densityData = React.useMemo(() => {
    const counts = customers.reduce((acc, c) => {
      const z = c.zone || 'Nules (Villa)';
      acc[z] = (acc[z] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }, [customers]);

  const maxDensity = Math.max(...densityData.map(d => d.count), 1);

  return (
  <div className="space-y-8 relative max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
      <div className="space-y-1">
        <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter">
          ¡Hola {user?.name || 'Usuario'}!
        </h2>
        <p className="text-brand-primary text-sm mt-3 font-bold uppercase tracking-[0.2em]">Monitorización en tiempo real • Mamma Mia Nules</p>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        {(role === 'JEFE' || role === 'ENCARGADO') && (
            <>
              <button onClick={() => navigate('/admin')} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-light-blue text-white transition-all px-5 py-2.5 rounded-2xl font-bold font-sans">
                <Settings size={18} />
                <span className="text-sm">Admin PGLite</span>
              </button>
              <button 
                onClick={() => setShowImporter(true)} 
                className="flex items-center gap-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary transition-all px-5 py-2.5 rounded-2xl border border-brand-primary/20 hover:scale-105 active:scale-95 group font-bold font-sans shadow-lg"
              >
                <Users size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm">Importar CRM</span>
              </button>
            </>
        )}
        <button onClick={() => navigate('/cliente')} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-yellow text-black transition-all px-5 py-2.5 rounded-2xl font-bold font-sans shadow-lg hover:scale-105 active:scale-95">
          <span className="text-sm">App Cliente</span>
        </button>
        <button onClick={() => navigate('/tauleta')} className="flex items-center gap-2 bg-surface-container hover:bg-white/5 transition-all px-5 py-2.5 rounded-2xl border border-white/5 font-bold font-sans shadow-lg hover:scale-105 active:scale-95">
          <span className="text-sm text-gray-300">Tauleta UI</span>
        </button>
        <div className="flex items-center gap-3 bg-surface-container/50 px-5 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-bold text-gray-300">Cocina: Operativa</span>
        </div>
      </div>
    </div>

    {lowStockItems.length > 0 && (
        <div className="bg-brand-red/10 border border-brand-red/30 rounded-2xl p-4 mb-6 flex items-start gap-4">
            <AlertCircle className="text-brand-red shrink-0 mt-0.5" size={24} />
            <div>
                <h4 className="text-brand-red font-bold uppercase tracking-widest text-sm mb-1">Stock Bajo Detectado</h4>
                <p className="text-brand-red/80 text-xs">
                    Hay {lowStockItems.length} producto(s) por debajo de su nivel mínimo: 
                    <span className="font-bold ml-1">{lowStockItems.map(i => i.name).join(', ')}</span>
                </p>
            </div>
        </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-surface-container rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-brand-red/30 transition-colors shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-brand-red group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Star size={100} />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <h3 className="font-bold text-gray-400 uppercase tracking-[0.2em] text-xs">Ingresos de Hoy</h3>
          <span className="bg-brand-red/20 text-brand-red px-3 py-1 rounded-full text-xs font-black shadow-[0_0_15px_rgba(255,107,107,0.3)]">+12%</span>
        </div>
        <div className="text-5xl font-display font-black text-white relative z-10 tracking-tight">€{revenue.toFixed(2)}</div>
      </div>
      <div className="bg-surface-container rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-brand-yellow/30 transition-colors shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-brand-yellow group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Package size={100} />
        </div>
        <h3 className="font-bold text-gray-400 uppercase tracking-[0.2em] text-xs relative z-10">Pedidos Activos</h3>
        <div className="text-5xl font-display font-black text-brand-yellow relative z-10">{activeOrders}</div>
      </div>
      <div className="bg-surface-container rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-blue-500/30 transition-colors shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-blue-500 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <RotateCcw size={100} />
        </div>
        <h3 className="font-bold text-gray-400 uppercase tracking-[0.2em] text-xs relative z-10">Pendientes (Prep)</h3>
        <div className="text-5xl font-display font-black text-blue-400 relative z-10">{pendingOrders}</div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-surface-container to-surface-base rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between h-48 shadow-xl">
        <div className="flex justify-between items-start">
             <h3 className="font-bold text-gray-400 uppercase tracking-[0.2em] text-xs flex items-center gap-2"><Users size={16} className="text-brand-primary"/> Base de Clientes</h3>
             <span className="bg-white/10 text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-widest">CRM</span>
        </div>
        <div className="text-5xl font-display font-black text-white tracking-tight">{customers.length.toLocaleString()}</div>
      </div>
      <div className="bg-gradient-to-br from-surface-container to-surface-base rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between h-48 shadow-xl">
        <h3 className="font-bold text-gray-400 uppercase tracking-[0.2em] text-xs">Nuevos Registros (Mes)</h3>
        <div className="flex items-end gap-3 align-baseline">
            <div className="text-5xl font-display font-black text-green-400 leading-none">+24</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">clientes</div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-surface-container to-surface-base rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between h-48 shadow-xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h3 className="font-bold text-gray-400 uppercase tracking-[0.2em] text-xs relative z-10">ZONA HOT (Más Pedidos)</h3>
        <div className="text-3xl font-display font-black text-brand-secondary mt-auto truncate relative z-10 tracking-tight" title={topZone}>{topZone}</div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-surface-container rounded-[2rem] p-8 md:p-10 border border-white/5 lg:col-span-2 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 relative z-10">
          <h3 className="text-xl md:text-2xl font-display font-black text-white flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-[0_0_20px_rgba(255,228,175,0.1)] border border-brand-primary/20">
                <Search size={24} />
            </span>
            Mapa de Densidad
          </h3>
          <span className="text-xs text-brand-primary uppercase font-bold tracking-[0.2em] bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
              {customers.length} Registros
          </span>
        </div>
        <div className="relative z-10 h-[400px] rounded-3xl overflow-hidden border border-white/10 mt-4">
          {hasValidKey ? (
            <Map
               defaultZoom={13}
               defaultCenter={{ lat: 39.8530, lng: -0.1560 }}
               mapId="DEMO_MAP_ID"
               disableDefaultUI={true}
               internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
               style={{ width: '100%', height: '100%' }}
            >
               <DeckGlOverlay
                  layers={[
                     new HeatmapLayer({
                       id: 'heatmapLayer',
                       data: customers.map((c, i) => {
                         // Mock lat/lng based on area
                         let latBase = 39.8530;
                         let lngBase = -0.1560;
                         if (c.zone?.toUpperCase().includes('VILAVEL')) { latBase = 39.854; lngBase = -0.185; }
                         if (c.zone?.toUpperCase().includes('MONCOFA')) { latBase = 39.825; lngBase = -0.145; }
                         if (c.zone?.toUpperCase().includes('PLAYA')) { latBase = 39.835; lngBase = -0.115; }
                         if (c.zone?.toUpperCase().includes('BURRIANA')) { latBase = 39.889; lngBase = -0.083; }
  
                         return {
                           position: [
                             lngBase + (Math.random() - 0.5) * 0.02,
                             latBase + (Math.random() - 0.5) * 0.02
                           ],
                           weight: 1 
                         };
                       }),
                       getPosition: (d: any) => d.position,
                       getWeight: (d: any) => d.weight,
                       radiusPixels: 40,
                       intensity: 2,
                       threshold: 0.1,
                       colorRange: [
                         [25, 43, 102], // dark blue
                         [52, 94, 219], // blue
                         [46, 204, 113], // green
                         [241, 196, 15], // yellow
                         [230, 126, 34], // orange
                         [231, 76, 60], // pink/red
                         [192, 57, 43] // dark red
                       ]
                     })
                  ]}
               />
            </Map>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-black/50">
                <MapPin size={48} className="mb-4 opacity-50" />
                <p className="font-bold">El mapa de calor no está disponible</p>
                <p className="text-xs mt-2 uppercase tracking-widest max-w-xs">Configurar Gmaps API Key</p>
             </div>
          )}
        </div>
      </div>
      
      <div className="bg-surface-container rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
        <h3 className="text-xl md:text-2xl font-serif text-brand-red mb-8 tracking-tight flex items-center gap-3">
             <span className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center border border-brand-red/20 shadow-[0_0_15px_rgba(255,107,107,0.2)]">
                <Settings size={20} className="text-brand-red animate-[spin_4s_linear_infinite]" />
             </span>
            Stock Crítico
        </h3>
        <div className="space-y-4 relative z-10">
          {[
            { id: 1, name: 'Harina 00', stock: 12, unit: 'kg' },
            { id: 2, name: 'Mozzarella', stock: 4, unit: 'kg' }
          ].map(ing => (
            <div key={ing.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
                  !
                </div>
                <div>
                  <p className="font-bold text-white">{ing.name}</p>
                  <p className="text-xs text-brand-red">Stock crítico: {ing.stock}{ing.unit} restantes</p>
                </div>
              </div>
              <button 
                onClick={() => {
                   const doc = new jsPDF();
                   doc.setFontSize(22);
                   doc.text('ORDEN DE COMPRA - MAMMA MIA!', 20, 20);
                   doc.setFontSize(12);
                   doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
                   doc.text('Proveedor: Varios', 20, 40);
                   
                   autoTable(doc, {
                     startY: 50,
                     head: [['Producto', 'Cantidad Solicitada', 'Notas']],
                     body: [
                       [ing.name, `50 ${ing.unit}`, 'Urgente']
                     ],
                   });
                   
                   doc.save(`orden_compra_${ing.name.toLowerCase().replace(/ /g, '_')}.pdf`);
                }}
                className="text-xs font-bold text-brand-red flex-shrink-0 uppercase border border-brand-red/30 px-3 py-1 rounded-full hover:bg-brand-red hover:text-white transition-all flex items-center gap-1"
              >
                <Printer size={12} />
                Pedir PDF
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-surface-container rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-brand-primary/5 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-start mb-6">
            <div>
                 <h3 className="text-xl md:text-2xl font-display font-black text-white mb-2 tracking-tight">Ingresos Previstos</h3>
                 <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Evolución de ventas</p>
            </div>
            <div className="flex bg-black/50 border border-white/10 rounded-xl p-1">
                {[7, 14, 30].map(days => (
                    <button
                        key={days}
                        onClick={() => setDaysRange(days)}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                            daysRange === days ? "bg-brand-primary text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {days}D
                    </button>
                ))}
            </div>
        </div>
        <div className="h-72 w-full relative z-10 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#ffffff" opacity={0.05} vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9ca3af" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(24, 24, 26, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)', color: 'white', fontWeight: 'bold', padding: '12px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#E1B846', fontSize: '1.25rem', fontWeight: 900 }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Line type="monotone" dataKey="total" stroke="#E1B846" strokeWidth={4} dot={{ fill: '#1a1a1a', stroke: '#E1B846', strokeWidth: 3, r: 6 }} activeDot={{ r: 8, fill: '#E1B846', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    
    <div className="mt-8">
        <PushNotificationHistory />
    </div>
    
    {showImporter && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-brand-primary/50 relative shadow-2xl p-8">
          <button 
            onClick={() => setShowImporter(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 rounded-full p-2 hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-3xl font-display font-black text-white mb-8">Importar Clientes (.txt)</h2>
          <CustomerImporter />
        </div>
      </div>
    )}
  </div>
  );
};

const Inventory = () => {
  const { inventory, updateInventoryStock } = useStore();
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [adjustments, setAdjustments] = React.useState<Record<string, number>>({});

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(inventory.map(i => i.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const openBulkModal = () => {
    const initialAdjustments: Record<string, number> = {};
    inventory.forEach(item => {
      if (selectedItems.has(item.id)) {
        initialAdjustments[item.id] = item.currentStock;
      }
    });
    setAdjustments(initialAdjustments);
    setIsModalOpen(true);
  };

  const saveBulkAdjustments = () => {
    Object.entries(adjustments).forEach(([id, newStock]) => {
      updateInventoryStock(id, newStock);
    });
    setIsModalOpen(false);
    setSelectedItems(new Set());
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Informe de Inventario", 14, 22);
    
    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, 30);
    
    // Table
    const tableData = inventory.map(item => {
      const isCritical = item.currentStock < item.minLevel;
      return [
        item.name,
        item.category,
        `${item.currentStock} ${item.unit}`,
        `${item.minLevel} ${item.unit}`,
        isCritical ? 'CRÍTICO' : 'Normal'
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'CRÍTICO') {
            data.cell.styles.textColor = [220, 38, 38]; // red
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    doc.save(`Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleGeneratePO = () => {
    const doc = new jsPDF();
    const lowStockItems = inventory.filter(i => i.currentStock <= i.minLevel);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Orden de Compra - Reposición", 14, 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, 30);
    
    if (lowStockItems.length === 0) {
       doc.text("¡Todo el stock está dentro de los niveles normales!", 14, 40);
    } else {
       const tableData = lowStockItems.map(item => [
         item.name, 
         item.category, 
         `${item.currentStock} ${item.unit}`, 
         `${item.minLevel} ${item.unit}`, 
         `${Math.max(0, item.minLevel * 2 - item.currentStock)} ${item.unit}` // Suggested to buy
       ]);
       
       autoTable(doc, {
         startY: 40,
         head: [['Producto', 'Categoría', 'Stock Actual', 'Mínimo', 'Cantidad a Pedir']],
         body: tableData,
         theme: 'grid',
         headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' } // Red header to mark urgency
       });
    }

    doc.save(`OrdenCompra_${new Date().toISOString().split('T')[0]}.pdf`);
  };

      const [chartCategory, setChartCategory] = React.useState<string>('ALL');
      
      const chartData = React.useMemo(() => {
          let data = inventory;
          if (chartCategory !== 'ALL') {
              data = data.filter(item => item.category === chartCategory);
          }
          // Sort so lowest stock relative to minimum comes first
          data = [...data].sort((a, b) => {
              const aRatio = a.currentStock / (a.minLevel || 1);
              const bRatio = b.currentStock / (b.minLevel || 1);
              return aRatio - bRatio;
          });
          // Show only top 20 items to avoid squishing
          return data.slice(0, 20).map(item => ({
              name: item.name,
              stock: item.currentStock,
              min: item.minLevel
          }));
      }, [inventory, chartCategory]);

      const uniqueCategories = React.useMemo(() => Array.from(new Set(inventory.map(i => i.category))), [inventory]);

  return (
    <div className="space-y-8 relative max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-surface-container/50 p-8 md:p-10 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-xl relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Wheat size={150} />
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter mb-2">Gestión de Almacén</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Control de ingredientes y envases</p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button
            onClick={handleExportPDF}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg border border-white/10 hover:border-white/30"
          >
            <Printer size={18} />
            Exportar PDF
          </button>
          
          <button
            onClick={handleGeneratePO}
            className="w-full sm:w-auto bg-brand-red hover:bg-brand-red/80 text-white font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,107,107,0.4)] border border-brand-red"
          >
            <ShoppingCart size={18} />
            Alerta Reabastecimiento
          </button>

          {selectedItems.size > 0 ? (
            <button 
              onClick={openBulkModal}
              className="w-full sm:w-auto bg-brand-primary text-black font-black px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 slide-in-from-right-4 animate-in duration-300 shadow-[0_0_30px_rgba(225,184,70,0.3)]"
            >
              Ajuste Masivo ({selectedItems.size})
            </button>
          ) : (
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/10 hidden lg:block">
                  Selecciona items para editar
              </div>
          )}
        </div>
      </div>

      <div className="bg-surface-container rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-display font-black text-white tracking-tight">Niveles de Stock vs Mínimo <span className="text-brand-primary text-sm ml-2">(Top 20 Críticos)</span></h3>
            <select 
                value={chartCategory} 
                onChange={(e) => setChartCategory(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-brand-primary"
            >
                <option value="ALL">Todas las Categorías</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        
        <div className="h-80 w-full text-xs font-bold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 10 }} tickMargin={15} angle={-35} textAnchor="end" interval={0} height={70} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                cursor={{ fill: '#ffffff0a' }}
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '1rem', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="stock" name="Stock Actual" fill="#e1b846" radius={[4, 4, 0, 0]} />
              <Bar dataKey="min" name="Stock Mínimo" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface-container rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-black/50 text-brand-primary uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="p-6 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.size === inventory.length && inventory.length > 0}
                    onChange={handleSelectAll}
                    className="accent-brand-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-6">Producto</th>
                <th className="p-6">Categoría</th>
                <th className="p-6">Unidad</th>
                <th className="p-6">Estado</th>
                <th className="p-6 text-right">Stock Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.map((item) => {
                const isBelowMin = item.currentStock < item.minLevel;
                // Calculate percentage for visual bar (cap at 100%)
                const maxBarStock = Math.max(100, item.minLevel * 3);
                const percent = Math.min(100, Math.max(0, (item.currentStock / maxBarStock) * 100));

                return (
                <tr key={item.id} className={cn("transition-colors group", isBelowMin ? "bg-red-500/10 hover:bg-red-500/20 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "hover:bg-white/5")}>
                  <td className="p-6 w-12 relative">
                    {isBelowMin && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-brand-red rounded-r-full animate-pulse" />
                    )}
                     <input 
                      type="checkbox" 
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelect(item.id)}
                      className="accent-brand-primary w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {item.image && (
                         <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-black/20 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-gray-500 font-normal mt-1">Mínimo: {item.minLevel} {item.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-gray-400 text-sm uppercase tracking-wider">{item.category}</td>
                  <td className="p-6 text-gray-400">{item.unit}</td>
                  <td className="p-6">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border", 
                      item.currentStock > item.minLevel ? "bg-green-500/10 border-green-500/30 text-green-500" : 
                      item.currentStock > 0 ? "bg-brand-yellow/10 border-brand-yellow/30 text-brand-yellow" : 
                      "bg-brand-red/10 border-brand-red/30 text-brand-red"
                    )}>
                      {item.currentStock > item.minLevel ? 'En Stock' : item.currentStock > 0 ? 'Stock Bajo' : 'Agotado'}
                    </span>
                  </td>
                  <td className="p-6 text-right w-64">
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center justify-end gap-3 bg-black/40 rounded-full py-1 px-1 border border-white/5">
                          <button 
                            onClick={() => updateInventoryStock(item.id, Math.max(0, item.currentStock - 1))}
                            className="text-gray-500 hover:text-white bg-transparent outline-none w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                          >-</button>
                          <span className={cn("text-xl font-display font-black w-10 text-center", isBelowMin ? "text-brand-red" : "text-white")}>{item.currentStock}</span>
                          <button 
                              onClick={() => updateInventoryStock(item.id, item.currentStock + 1)}
                              className="text-gray-500 hover:text-brand-primary bg-transparent outline-none w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                          >+</button>
                        </div>
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5 mt-1">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", isBelowMin ? "bg-brand-red" : "bg-brand-primary")}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-2xl font-display font-black text-white">Ajuste Masivo de Stock</h3>
              <p className="text-gray-400 text-sm mt-1">Actualiza el stock de los ingredientes seleccionados simultáneamente.</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-black/20">
              <div className="space-y-4">
                 {inventory.filter(i => selectedItems.has(i.id)).map(item => (
                   <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex flex-col">
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-xs text-gray-500">Unidad: {item.unit} | Stock actual: {item.currentStock}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <input 
                           type="number" 
                           min="0"
                           className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 w-32 focus:border-brand-primary outline-none focus:ring-1 focus:ring-brand-primary transition-colors text-right"
                           value={adjustments[item.id] ?? item.currentStock}
                           onChange={(e) => {
                             const val = parseInt(e.target.value);
                             setAdjustments(prev => ({...prev, [item.id]: isNaN(val) ? 0 : val}))
                           }}
                        />
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-surface flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={saveBulkAdjustments}
                className="px-6 py-3 rounded-xl font-bold bg-brand-primary text-black hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
              >
                Guardar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderProgressBar = ({ status, type }: { status: string, type: string }) => {
  const steps = type === 'DOMICILIO' 
    ? ['PENDIENTE', 'PREPARANDO', 'LISTO', 'EN_REPARTO', 'COMPLETADO']
    : ['PENDIENTE', 'PREPARANDO', 'LISTO', 'COMPLETADO'];
    
  const currentIndex = steps.indexOf(status);
  
  return (
    <div className="w-full mt-4 mb-2">
      <div className="flex items-center gap-1 w-full mb-1">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          
          let colorClass = "bg-white/10";
          if (isCompleted || isCurrent) {
             if (step === 'PENDIENTE') colorClass = "bg-brand-red";
             else if (step === 'PREPARANDO') colorClass = "bg-brand-yellow";
             else if (step === 'LISTO') colorClass = "bg-green-500";
             else if (step === 'EN_REPARTO') colorClass = "bg-brand-secondary";
             else if (step === 'COMPLETADO') colorClass = "bg-brand-primary";
          }
          
          return (
             <div 
              key={step} 
              className={cn("h-1.5 w-full transition-all duration-500", colorClass, isCurrent ? "opacity-100" : isCompleted ? "opacity-40" : "", idx === 0 ? "rounded-l-full" : "", idx === steps.length - 1 ? "rounded-r-full" : "")} 
             />
          );
        })}
      </div>
      <div className="flex justify-between items-center px-1">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          return (
            <span key={step} className={cn("text-[8px] font-black uppercase tracking-wider text-center", isCurrent ? "text-white" : isCompleted ? "text-gray-400" : "text-gray-600 truncate")}>
               {step.replace('EN_REPARTO', 'REPARTO')}
            </span>
          );
        })}
      </div>
    </div>
  );
};

function AddressMap({ address }: { address: string }) {
  if (!hasValidKey) return null;
  const geocodingLib = useMapsLibrary('geocoding');
  const [location, setLocation] = React.useState<google.maps.LatLngLiteral | null>(null);

  React.useEffect(() => {
    if (!geocodingLib || !address) return;
    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
         setLocation(results[0].geometry.location.toJSON());
      } else {
         console.warn("Geocode was not successful: " + status);
      }
    });
  }, [geocodingLib, address]);

  if (!location) return (
      <div className="h-32 w-full bg-white/5 rounded-xl flex items-center justify-center text-xs text-gray-500 mt-4 border border-white/5">
        Cargando mapa...
      </div>
  );

  return (
      <div className="h-40 w-full rounded-xl overflow-hidden mt-4 relative border border-white/5 shadow-inner">
        <Map
            defaultCenter={location}
            defaultZoom={15}
            mapId="DELIVERY_ORDER_MAP"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            disableDefaultUI={true}
            gestureHandling="none"
        >
            <AdvancedMarker position={location}>
                <Pin background="#brand-secondary" glyphColor="#000" />
            </AdvancedMarker>
        </Map>
      </div>
  );
}

const Orders = () => {
    const { orders, updateOrderStatus } = useStore();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = React.useState<Order['status'] | 'ALL'>('ALL');
    const [printingOrder, setPrintingOrder] = React.useState<typeof orders[0] | null>(null);
    const [orderToComplete, setOrderToComplete] = React.useState<string | null>(null);
    const [activeTab, setActiveTab] = React.useState<'TODOS' | 'MESA' | 'RECOGIDA' | 'DOMICILIO'>('TODOS');

    const handlePrint = (order: typeof orders[0]) => {
        setPrintingOrder(order);
        setTimeout(() => {
            window.print();
            setPrintingOrder(null);
        }, 300);
    };
    
    // Filter active orders first (or completed if they match the date)
    const dateFilteredOrders = orders.filter(o => !o.date || o.date === selectedDate);
    
    // Then apply search and status filter and activeTab
    const filteredOrders = dateFilteredOrders.filter(o => 
        (statusFilter === 'ALL' || o.status === statusFilter) &&
        (activeTab === 'TODOS' || o.type === activeTab) &&
        (o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.phone && o.phone.includes(searchTerm)))
    );
    
    const newCount = filteredOrders.filter(o => o.status === 'PENDIENTE').length;
    const readyCount = filteredOrders.filter(o => o.status === 'LISTO').length;

    const handleExportCSV = async () => {
        try {
            // Fetch push logs history
            const res = await fetch('/api/push/logs');
            const pushLogs = await res.json();
            
            // Format orders to CSV string
            const headers = ['ID Pedido', 'Fecha', 'Hora', 'Cliente', 'Teléfono', 'Tipo', 'Estado', 'Total', 'Método Pago', 'Historial Notificaciones'];
            
            const rows = filteredOrders.map(order => {
                let pushHistory = "Sin historial";
                if (order.phone) {
                   const matchedLogs = pushLogs.filter((log: any) => 
                      log.details.some((d: any) => d.phone === order.phone && d.status === 'success')
                   );
                   if (matchedLogs.length > 0) {
                      pushHistory = matchedLogs.map((log: any) => `${new Date(log.sentAt).toLocaleString('es-ES')} - ${log.title}`).join(' | ');
                   }
                }

                return [
                    order.id,
                    order.date || '',
                    order.time || '',
                    `"${order.customer}"`,
                    order.phone || '',
                    order.type,
                    order.status,
                    order.total.toFixed(2),
                    order.paymentMethod || 'EFECTIVO',
                    `"${pushHistory}"`
                ].join(',');
            });
            
            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pedidos_${selectedDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (e) {
            console.error("Error al exportar CSV", e);
            alert("Hubo un error al exportar CSV");
        }
    };

    const renderOrderCard = (order: typeof orders[0]) => (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            key={order.id} 
            className={`bg-surface-container-high rounded-2xl p-6 border ${order.status === 'LISTO' ? 'border-green-500' : 'border-white/5'} hover:border-brand-primary/30 transition-all group`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                <span className="text-3xl font-display font-black text-brand-primary">#{order.id}</span>
                <p className="text-sm text-gray-500 font-bold">{order.time} • {order.customer}</p>
                {order.address && <p className="text-sm text-brand-secondary">{order.address}</p>}
                {order.table && <p className="text-sm text-brand-primary">Mesa: {order.table}</p>}
                {order.paymentMethod && <p className="text-xs uppercase text-green-400 font-bold mt-1">Pago: {order.paymentMethod}</p>}
                </div>
                <span className={`text-white text-[10px] uppercase font-black px-2 py-1 rounded ${order.status === 'PENDIENTE' ? 'bg-brand-red' : order.status === 'PREPARANDO' ? 'bg-brand-yellow text-black' : order.status === 'LISTO' ? 'bg-green-500 text-black' : order.status === 'EN_REPARTO' ? 'bg-brand-secondary text-black' : order.status === 'COMPLETADO' ? 'bg-gray-600 text-white' : 'bg-brand-primary text-black'}`}>
                    {order.status.replace('_', ' ')}
                </span>
            </div>
            
            <OrderProgressBar status={order.status} type={order.type} />
            
            {order.type === 'DOMICILIO' && order.address && (
                <AddressMap address={order.address} />
            )}

            <div className="space-y-2 mb-6 mt-4 text-sm font-bold text-gray-300">
                {order.items.map((item, idx) => (
                    <p key={idx} className="flex items-center gap-2">{item}</p>
                ))}
            </div>
            {order.status === 'LISTO' && order.type === 'MESA' && (
                <button onClick={() => setOrderToComplete(order.id)} className="w-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-black font-bold py-4 md:py-3 rounded-xl transition-all border border-green-500/50 active:scale-95 text-base md:text-sm mt-3 shadow-sm">
                    Entregar al Cliente
                </button>
            )}
            {order.status === 'LISTO' && order.type === 'DOMICILIO' && (
                <button onClick={() => updateOrderStatus(order.id, 'EN_REPARTO')} className="w-full bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary hover:text-black font-bold py-4 md:py-3 rounded-xl transition-all border border-brand-secondary/50 active:scale-95 text-base md:text-sm mt-3 shadow-sm">
                    Asignar Repartidor
                </button>
            )}
            {order.status === 'COMPLETADO' && (
                <button onClick={() => handlePrint(order)} className="w-full flex items-center justify-center gap-2 bg-white/5 text-white hover:bg-white/10 font-bold py-4 md:py-3 rounded-xl transition-all border border-white/10 mt-3 active:scale-95 text-base md:text-sm shadow-sm">
                    <Printer size={18} /> Imprimir Ticket
                </button>
            )}
        </motion.div>
    );

    return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 max-w-7xl mx-auto">
      <ConfirmModal 
        isOpen={!!orderToComplete}
        title="Completar Pedido"
        description="¿Confirmas que el pedido ha sido entregado correctamente al cliente?"
        confirmText="Completado"
        onConfirm={() => { if (orderToComplete) updateOrderStatus(orderToComplete, 'COMPLETADO'); }}
        onClose={() => setOrderToComplete(null)}
        type="success"
      />
      {printingOrder && (
          <div id="print-root">
              <div style={{ textAlign: 'center', borderBottom: '2px dashed black', paddingBottom: '10px', marginBottom: '10px' }}>
                  <h2 style={{ fontSize: '24px', margin: '0' }}>MAMMA MIA RESTAURANTE</h2>
                  <p style={{ margin: '5px 0' }}>Ticket de Comanda</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                  <p><strong>Pedido:</strong> #{printingOrder.id}</p>
                  <p><strong>Fecha:</strong> {printingOrder.date || ''} {printingOrder.time}</p>
                  <p><strong>Tipo:</strong> {printingOrder.type}</p>
                  {printingOrder.table && <p><strong>Mesa:</strong> {printingOrder.table}</p>}
                  <p><strong>Cliente:</strong> {printingOrder.customer}</p>
              </div>
              <div style={{ borderTop: '2px dashed black', paddingTop: '10px', marginBottom: '15px' }}>
                  {printingOrder.items.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: '5px' }}>{item}</div>
                  ))}
              </div>
              <div style={{ borderTop: '2px dashed black', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{printingOrder.paymentMethod || 'EFECTIVO'}</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Total: €{printingOrder.total.toFixed(2)}</p>
              </div>
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>Escanea para seguir tu pedido</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <QRCodeSVG value={`${window.location.origin}/cliente`} size={100} />
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-surface-container/50 p-6 md:p-8 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-xl">
        <div>
           <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white mb-2">Visor de Pedidos</h2>
           <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Filtrando jornada: {selectedDate}</p>
        </div>
        <div className="flex flex-col xl:flex-row items-center gap-4 w-full xl:w-auto mt-4 xl:mt-0">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto">
                <div className="relative w-full sm:w-auto">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full sm:w-44 bg-surface-base border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white font-bold tracking-wide focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer shadow-inner"
                    />
                </div>
                <div className="relative w-full sm:w-auto flex-1">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'ALL')}
                        className="w-full sm:w-44 bg-surface-base border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold tracking-wide text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer appearance-none shadow-inner"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="PENDIENTE">🔴 Pendiente</option>
                        <option value="PREPARANDO">🟡 Preparando</option>
                        <option value="LISTO">🟢 Listo</option>
                        <option value="EN_REPARTO">🛵 En Reparto</option>
                        <option value="COMPLETADO">✔️ Completado</option>
                    </select>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar ID, Cliente..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-base border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold tracking-wide text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                    />
                </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t border-white/5 sm:border-t-0 mt-2 sm:mt-0">
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 bg-surface-base hover:bg-white/5 text-gray-300 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl border border-white/10 transition-all shadow-inner"
                    title="Exportar a CSV"
                >
                    <Download size={16} />
                    Exportar
                </button>
                <div className="bg-brand-red/10 text-brand-red font-black text-xs px-5 py-3 rounded-2xl border border-brand-red/20 shadow-[0_0_15px_rgba(255,107,107,0.2)] whitespace-nowrap flex-1 text-center sm:flex-none uppercase tracking-[0.2em] relative overflow-hidden group hover:scale-[1.02] transition-transform">{newCount} Nuevos</div>
                <div className="bg-green-500/10 text-green-400 font-black text-xs px-5 py-3 rounded-2xl border border-green-400/20 shadow-[0_0_15px_rgba(34,197,94,0.1)] whitespace-nowrap flex-1 text-center sm:flex-none uppercase tracking-[0.2em] relative overflow-hidden group hover:scale-[1.02] transition-transform">{readyCount} Listos</div>
            </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 overflow-x-auto custom-scrollbar pb-2">
          <button onClick={() => setActiveTab('TODOS')} className={`px-6 py-3 rounded-t-xl font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'TODOS' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              Todos
          </button>
          <button onClick={() => setActiveTab('MESA')} className={`px-6 py-3 rounded-t-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${activeTab === 'MESA' ? 'bg-brand-primary/20 text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5'}`}>
              Mesa <span className="bg-black/50 px-2 py-0.5 rounded-full text-xs">{filteredOrders.filter(o => o.type === 'MESA').length}</span>
          </button>
          <button onClick={() => setActiveTab('RECOGIDA')} className={`px-6 py-3 rounded-t-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${activeTab === 'RECOGIDA' ? 'bg-brand-yellow/20 text-brand-yellow border-b-2 border-brand-yellow' : 'text-gray-500 hover:text-brand-yellow hover:bg-brand-yellow/5'}`}>
              Recogida <span className="bg-black/50 px-2 py-0.5 rounded-full text-xs">{filteredOrders.filter(o => o.type === 'RECOGIDA').length}</span>
          </button>
          <button onClick={() => setActiveTab('DOMICILIO')} className={`px-6 py-3 rounded-t-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${activeTab === 'DOMICILIO' ? 'bg-brand-secondary/20 text-brand-secondary border-b-2 border-brand-secondary' : 'text-gray-500 hover:text-brand-secondary hover:bg-brand-secondary/5'}`}>
              Domicilio <span className="bg-black/50 px-2 py-0.5 rounded-full text-xs">{filteredOrders.filter(o => o.type === 'DOMICILIO').length}</span>
          </button>
      </div>

      <div className={`grid gap-8 ${activeTab === 'TODOS' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {(activeTab === 'TODOS' || activeTab === 'MESA') && (
        <section className="bg-surface-container rounded-[2rem] p-8 border border-white/5 space-y-8 shadow-xl">
          <h3 className="text-2xl font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-3 border-b border-white/5 pb-4">
             En Mesa
          </h3>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
                {filteredOrders.filter(o => o.type === 'MESA').map(renderOrderCard)}
            </AnimatePresence>
            {filteredOrders.filter(o => o.type === 'MESA').length === 0 && <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-center mt-8">Libre</p>}
          </div>
        </section>
        )}

        {(activeTab === 'TODOS' || activeTab === 'RECOGIDA') && (
        <section className="bg-surface-container rounded-[2rem] p-8 border border-white/5 space-y-8 shadow-xl">
          <h3 className="text-2xl font-black text-brand-yellow uppercase tracking-[0.2em] flex items-center gap-3 border-b border-white/5 pb-4">
             Para Recoger
          </h3>
          <div className="space-y-4">
             <AnimatePresence mode="popLayout">
                {filteredOrders.filter(o => o.type === 'RECOGIDA').map(renderOrderCard)}
             </AnimatePresence>
            {filteredOrders.filter(o => o.type === 'RECOGIDA').length === 0 && <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-center mt-8">Libre</p>}
          </div>
        </section>
        )}

        {(activeTab === 'TODOS' || activeTab === 'DOMICILIO') && (
        <section className="bg-surface-container rounded-[2rem] p-8 border border-white/5 space-y-8 shadow-xl">
          <h3 className="text-2xl font-black text-brand-secondary uppercase tracking-[0.2em] flex items-center gap-3 border-b border-white/5 pb-4">
             A Domicilio
          </h3>
          <div className="space-y-4">
             <AnimatePresence mode="popLayout">
                {filteredOrders.filter(o => o.type === 'DOMICILIO').map(renderOrderCard)}
             </AnimatePresence>
            {filteredOrders.filter(o => o.type === 'DOMICILIO').length === 0 && <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-center mt-8">Libre</p>}
          </div>
        </section>
        )}
      </div>
    </div>
    );
};

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

const Profile = () => {
    const { user, role, updateUser } = useAuth();
    const { orders, addOrder } = useStore();
    const [showNotificationGuide, setShowNotificationGuide] = React.useState(false);
    const [pushEnabled, setPushEnabled] = React.useState(false);
    const [pushSubscription, setPushSubscription] = React.useState<PushSubscription | null>(null);
    const [newAddress, setNewAddress] = React.useState('');
    const [isSavingAddress, setIsSavingAddress] = React.useState(false);

    const handleSaveAddress = () => {
        if (!newAddress.trim() || !user || !updateUser) return;
        setIsSavingAddress(true);
        const currentAddresses = user.savedAddresses || [];
        updateUser(user.id, { savedAddresses: [...currentAddresses, newAddress.trim()] });
        setNewAddress('');
        setIsSavingAddress(false);
    };

    const handleRemoveAddress = (indexToRemove: number) => {
        if (!user || !updateUser || !user.savedAddresses) return;
        const newAddresses = user.savedAddresses.filter((_, idx) => idx !== indexToRemove);
        updateUser(user.id, { savedAddresses: newAddresses });
    };

    React.useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setPushEnabled(true);
                        setPushSubscription(sub);
                    }
                });
            });
        }
    }, []);

    const togglePushNotifications = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Las notificaciones Push no están soportadas en este navegador.');
            return;
        }

        try {
            const reg = await navigator.serviceWorker.ready;
            if (pushEnabled && pushSubscription) {
                const unsubscribed = await pushSubscription.unsubscribe();
                if (unsubscribed) {
                    setPushEnabled(false);
                    setPushSubscription(null);
                }
            } else {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    alert('Permiso de notificación denegado. Actívalo en los ajustes de tu navegador.');
                    return;
                }

                // Clave pública VAPID (dummy para demo o del usuario)
                const publicVapidKey = user?.vapidKey || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                });

                console.log('User is subscribed to Web Push:', sub);
                // @ts-ignore
                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    reg.showNotification('¡Suscripción exitosa!', {
                        body: 'Recibirás avisos cuando tu pedido esté listo o en reparto.',
                        icon: '/icon.svg'
                    });
                }

                setPushSubscription(sub);
                setPushEnabled(true);
            }
        } catch (e) {
            console.error('Error configurando Push:', e);
            alert('Hubo un error al configurar las notificaciones.');
        }
    };

    // user is available, or fallback to Marco Rossi if not logged in for visual purposes (preview)
    const displayName = user?.name || "Marco Rossi";
    const displayPhone = user?.phone || "+34 612 345 678";
    const displayRole = role || "Chef Ejecutivo";
    
    const [historyOrders, setHistoryOrders] = React.useState<any[]>([]);
    
    React.useEffect(() => {
        const fetchHistory = async () => {
            const history = await dbService.getOrdersHistory(displayPhone);
            setHistoryOrders(history);
        };
        fetchHistory();
    }, [displayPhone, orders]);

    const userOrders = orders.filter(o => o.customer === displayName || o.phone === displayPhone);

    const handleRepeatOrder = (order: typeof orders[0]) => {
        const newOrder = {
            ...order,
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            status: 'PENDIENTE' as const,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now()
        };
        addOrder(newOrder);
        alert("¡Pedido repetido y enviado a cocina!");
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-top-10 duration-700">
            <section className="relative bg-surface-container-high rounded-3xl p-8 md:p-12 overflow-hidden border-b-4 border-brand-yellow">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
                        <img src="https://images.unsplash.com/photo-1577214190833-28989b66236b?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover" alt={displayName} />
                    </div>
                    <div className="text-center md:text-left space-y-4">
                        <h2 className="text-6xl font-display font-black uppercase italic tracking-tighter">{displayName}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <span className="bg-brand-yellow text-black px-6 py-2 rounded-full font-black uppercase text-xs">{displayRole}</span>
                            <span className="bg-white/10 text-brand-primary px-6 py-2 rounded-full font-black uppercase text-xs">ID: {user?.id || 'MM-2024-089'}</span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <button className="bg-brand-primary/10 text-brand-primary font-bold px-8 py-3 rounded-xl border border-brand-primary/20 hover:bg-brand-primary/20 transition-all">Editar Perfil</button>
                            <button 
                                onClick={togglePushNotifications}
                                className={`notification-toggle-button font-bold px-8 py-3 rounded-xl border transition-all relative group flex items-center justify-center gap-2 ${
                                    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied' 
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' 
                                        : pushEnabled && pushSubscription
                                        ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' 
                                        : 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/20'
                                }`}>
                                {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied' && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                )}
                                {pushEnabled ? 'Desactivar Notificaciones' : 'Activar Notificaciones'}
                                {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied' && (
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] w-64 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-red-500/30">
                                        Permiso denegado. Para recibir avisos, cambia los ajustes de permisos del sitio a "Permitir" mediante el candado junto a la URL.
                                    </div>
                                )}
                            </button>
                            <button 
                                onClick={() => setShowNotificationGuide(true)}
                                className="bg-white/5 text-gray-300 font-bold px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex border border-white/10 items-center gap-2">
                                <Search className="w-4 h-4" /> Guía
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl"></div>
            </section>

            <AnimatePresence>
                {showNotificationGuide && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-surface-container w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface-container-high">
                                <h2 className="text-2xl font-display font-black text-brand-primary">Cómo activar notificaciones móviles</h2>
                                <button onClick={() => setShowNotificationGuide(false)} className="text-gray-400 hover:text-white p-2">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto space-y-8">
                                
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">🍎</div>
                                        Para iOS (iPhone / iPad)
                                    </h3>
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 text-sm text-gray-300">
                                        <p className="font-bold text-brand-yellow">Las notificaciones push en iOS web requieren Safari y añadir la app a tu pantalla de inicio.</p>
                                        <ul className="list-decimal pl-5 space-y-3">
                                            <li>Abre esta página web en <strong>Safari</strong>.</li>
                                            <li>Toca el botón <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) en la barra inferior.</li>
                                            <li>Desplázate hacia abajo y selecciona <strong>Añadir a la pantalla de inicio</strong>.</li>
                                            <li>Inicia la aplicación desde el nuevo icono en tu pantalla de inicio.</li>
                                            <li>Trata de iniciar sesión y pulsa en "Activar Notificaciones" dentro de tu Perfil. Te aparecerá el aviso de permisos nativo de iOS.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">🤖</div>
                                        Para Android
                                    </h3>
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 text-sm text-gray-300">
                                        <p className="font-bold text-brand-secondary">En Android es mucho más sencillo por defecto en Chrome.</p>
                                        <ul className="list-decimal pl-5 space-y-3">
                                            <li>Pulsa el botón <strong>"Activar Notificaciones"</strong> en tu perfil en esta aplicación.</li>
                                            <li>Si bloqueaste previamente las notificaciones, toca el <strong>icono del candado</strong> en la barra de direcciones de Chrome (arriba).</li>
                                            <li>Selecciona <strong>Permisos</strong> y luego asegúrate de que "Notificaciones" esté marcado en "Permitir".</li>
                                            <li>Refresca la página y vuelve a pulsar el botón en esta app.</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="bg-brand-red/10 border border-brand-red/20 rounded-2xl p-4 flex gap-4 text-brand-red text-sm">
                                    <div className="shrink-0 mt-1">⚠️</div>
                                    <p>Recuerda: Deberás tener activadas las notificaciones en los ajustes generales de tu teléfono para el navegador que estés utilizando (Safari o Chrome).</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-surface-container rounded-3xl p-8 border border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-8">Detalles</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase">Teléfono</p>
                                <p className="font-bold">{displayPhone}</p>
                            </div>
                            {user?.address && (
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase">Dirección</p>
                                    <p className="font-bold">{user.address}</p>
                                </div>
                            )}
                            {role !== 'CLIENTE' && (
                                <div className="pt-6 border-t border-white/5">
                                    <p className="text-[10px] text-brand-red font-black uppercase">Contacto Emergencia</p>
                                    <p className="font-bold">Giulia Rossi (Esposa)</p>
                                    <p className="text-sm text-gray-500">+34 699 887 766</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {role === 'CLIENTE' && (
                        <div className="bg-surface-container rounded-3xl p-8 border border-white/5 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Direcciones Guardadas</h3>
                            
                            <div className="space-y-3">
                                {user?.savedAddresses?.map((addr, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex gap-3 items-center">
                                            <MapPin className="w-4 h-4 text-brand-secondary" />
                                            <span className="text-sm font-bold">{addr}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveAddress(idx)}
                                            className="text-gray-500 hover:text-brand-red transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!user?.savedAddresses || user.savedAddresses.length === 0) && (
                                    <p className="text-gray-500 text-sm italic">No tienes direcciones guardadas.</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAddress()}
                                    placeholder="Ej: Calle Principal 4, 2B"
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary placeholder-gray-600"
                                />
                                <button 
                                    onClick={handleSaveAddress}
                                    disabled={!newAddress.trim() || isSavingAddress}
                                    className="bg-brand-secondary text-black p-3 rounded-xl hover:bg-brand-yellow transition-colors font-bold text-sm disabled:opacity-50"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    )}

                    {role !== 'CLIENTE' && (
                        <div className="bg-surface-container rounded-3xl p-8 border border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-8">Seguridad</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                    <span className="font-bold">Acceso Face ID</span>
                                    <div className="w-12 h-6 bg-brand-yellow rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-black rounded-full ml-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div id="profile-notification-settings" className="bg-surface-container rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Servicio de Notificaciones</h3>
                            <div className="flex items-center gap-4">
                                {pushEnabled && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-green-400">Activo</span>
                                        <div className="w-2 h-2 rounded-full bg-green-500 notification-status-indicator"></div>
                                    </div>
                                )}
                                <div 
                                    onClick={togglePushNotifications}
                                    className={`w-14 h-7 rounded-full relative p-1 cursor-pointer transition-colors ${pushEnabled ? 'bg-brand-primary' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 bg-black rounded-full transition-all ${pushEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-6 relative z-10">
                            {pushEnabled && pushSubscription
                                ? "Notificaciones Push activadas. Recibirás avisos en tiempo real sobre el estado de tus pedidos."
                                : "Para asegurar la recepción de avisos de estado ('LISTO', 'EN REPARTO'), activa el servicio y verifica los permisos en tu sistema operativo:"}
                        </p>
                        
                        {!pushEnabled && (
                            <div className="space-y-6 relative z-10">
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors">
                                    <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2"><span className="text-blue-400 text-lg">🍎</span> iOS e iPadOS</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">Abre <strong>Ajustes &gt; Notificaciones</strong>. Asegúrate de que tu aplicación web (añadida a la pantalla de inicio) tenga permiso para mostrar <strong>Tiras</strong> y sonido activado. No funcionará sin añadir al inicio.</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors">
                                    <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2"><span className="text-green-400 text-lg">🤖</span> Sistema Android</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">Accede a <strong>Ajustes &gt; Aplicaciones &gt; Tu Navegador (Chrome)</strong>. En el apartado de Permisos, verifica que <strong>Notificaciones</strong> esté concedido para este dominio.</p>
                                </div>
                            </div>
                        )}

                        {pushEnabled && pushSubscription && (
                            <div className="relative z-10 mt-6 pt-6 border-t border-white/5">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <div>
                                        <h4 className="font-bold text-sm text-white">VAPID Subscription</h4>
                                        <p className="text-xs text-gray-400 line-clamp-1 mt-1 opacity-70">
                                            {pushSubscription.endpoint.split('/').pop()?.substring(0, 30)}...
                                        </p>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if ('serviceWorker' in navigator && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                                                const btn = document.querySelector('.notification-status-indicator');
                                                if (btn) {
                                                    btn.classList.add('data-pulsing');
                                                    setTimeout(() => btn.classList.remove('data-pulsing'), 2000);
                                                }
                                                const reg = await navigator.serviceWorker.ready;
                                                reg.showNotification('¡Prueba de Notificación Exitosa!', {
                                                    body: 'Si puedes leer esto, estás listo para recibir actualizaciones.',
                                                    icon: '/icon.svg',
                                                    vibrate: [200, 100, 200]
                                                });
                                            }
                                        }}
                                        className="w-full sm:w-auto bg-surface-container hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl transition-all border border-white/20"
                                    >
                                        Probar Suscripción
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-8 space-y-8">
                    {role !== 'CLIENTE' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-surface-container-high p-8 rounded-3xl border-l-4 border-brand-primary">
                                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Horas Trabajadas</p>
                                <p className="text-4xl font-display font-black text-brand-primary">164.5</p>
                            </div>
                            <div className="bg-surface-container-high p-8 rounded-3xl border-l-4 border-brand-secondary">
                                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Horas Extra</p>
                                <p className="text-4xl font-display font-black text-brand-secondary">12.0</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-surface-container rounded-3xl p-8 border border-white/5">
                        <h3 className="text-xl font-black text-brand-primary uppercase tracking-tighter mb-6">Historial de Pedidos</h3>
                        {historyOrders.length === 0 ? (
                            <p className="text-gray-500">No tienes pedidos en tu historial.</p>
                        ) : (
                            <div className="space-y-4">
                                {historyOrders.map((order, index) => (
                                    <div key={`history-${order.id}-${index}`} className="bg-surface-container-high p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-brand-primary/30 transition-colors group">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="font-mono text-sm text-brand-yellow font-bold">#{order.id}</span>
                                                <span className="text-xs bg-black px-3 py-1 rounded-full text-gray-300 font-medium">
                                                    {new Date(order.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                                <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest
                                                    ${order.status === 'COMPLETADO' || order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                      order.status === 'pending' || order.status === 'PENDIENTE' ? 'bg-brand-red/20 text-brand-red border border-brand-red/30' :
                                                      'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'}
                                                `}>{order.status}</span>
                                            </div>
                                            <ul className="text-sm text-gray-300 space-y-2">
                                                {order.items?.map((item: any, idx: number) => (
                                                    <li key={idx} className="flex gap-2 items-start">
                                                       <span className="text-brand-primary font-bold">{item.quantity}x</span> 
                                                       <span>{item.name || 'Producto Desconocido'}</span>
                                                       {item.notes && <span className="italic text-gray-500 text-xs ml-2">({item.notes})</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-6 text-xl font-display font-black text-white px-4 py-2 bg-black/40 rounded-xl inline-block border border-white/5">
                                                Total: €{Number(order.total).toFixed(2)}
                                            </div>
                                        </div>
                                        <button 
                                            // Ensure order.items are transformed to match what addOrder expects natively if needed
                                            // The mock store takes string[] for items, here we pass the generic structure back with a mapping
                                            onClick={() => {
                                                const simpleItems = order.items?.map((i: any) => `${i.quantity}x ${i.name} ${i.notes ? `(${i.notes})` : ''}`) || [];
                                                handleRepeatOrder({ ...order, items: simpleItems });
                                            }}
                                            className="whitespace-nowrap shrink-0 flex items-center justify-center gap-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-black uppercase px-6 py-3 rounded-xl hover:bg-brand-primary hover:text-black transition-all md:self-end"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Repetir Pedido
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClockIn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [scanState, setScanState] = React.useState<'IDLE' | 'SCANNING_FACE' | 'SCANNING_FINGER' | 'SUCCESS'>('IDLE');

    const simulateScan = async (type: 'FACE' | 'FINGER') => {
        setScanState(type === 'FACE' ? 'SCANNING_FACE' : 'SCANNING_FINGER');
        
        // Simular escaneo de 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setScanState('SUCCESS');
        
        // Simular otro segundo antes de hacer login e ir a la home
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Autenticar a Chef Marco (Cocina) para Face ID o Carlos (Camarero) para Huella
        const phone = type === 'FACE' ? '600555666' : '600333444';
        await login(phone, '1234');
        navigate('/');
    };

    return (
      <div className="max-w-md mx-auto space-y-10 animate-in fade-in duration-500 relative">
        <div className="text-center space-y-2">
          <h2 className="text-6xl font-display font-black tracking-tighter">08:42 AM</h2>
          <p className="text-brand-primary font-black uppercase tracking-widest">Lunes, 23 Oct</p>
        </div>

        <div className="bg-surface-container rounded-3xl p-10 border-2 border-brand-secondary text-center space-y-4 shadow-[0_0_50px_rgba(255,179,177,0.1)]">
          <div className="w-20 h-20 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto text-brand-secondary">
            <Clock size={40} />
          </div>
          <h3 className="text-3xl font-display font-black text-brand-secondary">Turno Finalizado</h3>
          <p className="text-gray-400 font-bold">Próximo turno empieza a las 09:00 AM</p>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-black text-center">Autenticación Rápida</h4>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => simulateScan('FACE')}
              className={`bg-surface-container aspect-square rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 hover:border-brand-primary transition-all group overflow-hidden relative shadow-lg ${scanState === 'IDLE' ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''}`}
            >
                <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ScanFace size={40} className="text-brand-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="font-black text-xs uppercase text-brand-primary">Face ID</span>
            </button>
            <button 
              onClick={() => simulateScan('FINGER')}
              className={`bg-surface-container aspect-square rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 hover:border-brand-primary transition-all group overflow-hidden relative shadow-lg ${scanState === 'IDLE' ? 'animate-[pulse_3s_ease-in-out_infinite] delay-150' : ''}`}
            >
                <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Fingerprint size={40} className="text-brand-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="font-black text-xs uppercase text-brand-primary">Huella Dactilar</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
            {scanState !== 'IDLE' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-surface-container border-2 border-brand-primary/50 text-center p-10 rounded-[3rem] w-full max-w-sm shadow-[0_0_100px_rgba(255,228,175,0.2)]"
                    >
                        {scanState === 'SUCCESS' ? (
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                                    <Check size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-white">¡Acceso Concedido!</h3>
                                <p className="text-gray-400 font-bold">Redirigiendo a tu espacio...</p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand-primary rounded-full blur-[40px] opacity-20 animate-pulse"></div>
                                    <div className="relative w-32 h-32 flex items-center justify-center text-brand-primary border-4 border-brand-primary/30 rounded-full overflow-hidden">
                                        {scanState === 'SCANNING_FACE' ? (
                                            <ScanFace size={64} className="animate-pulse" />
                                        ) : (
                                            <Fingerprint size={64} className="animate-pulse" />
                                        )}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary shadow-[0_0_20px_#FFE4AF] animate-[scan_2s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-brand-primary tracking-tight">Escaneando</h3>
                                    <p className="text-gray-400 font-bold tracking-widest text-xs uppercase animate-pulse">
                                        {scanState === 'SCANNING_FACE' ? 'Mira a la cámara' : 'Mantén el dedo en el sensor'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    );
};

function RouteDisplay({ origin, destination }: {
  origin: string | google.maps.LatLngLiteral;
  destination: string | google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = React.useRef<google.maps.Polyline[]>([]);

  React.useEffect(() => {
    if (!routesLib || !map) return;
    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => p.setMap(map));
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

const Delivery = () => {
    const { orders, updateOrderStatus, storeSettings } = useStore();
    const deliveryOrders = orders.filter(o => o.status !== 'COMPLETADO' && (o.type === 'DOMICILIO' || o.type === 'RECOGIDA'));
    const [selectedOrderAddress, setSelectedOrderAddress] = React.useState<string | null>(null);
    const [orderToComplete, setOrderToComplete] = React.useState<string | null>(null);

    const OriginLocation = 'Nules, Castellón, Spain'; // Fake store origin for demo

    return (
    <div className="space-y-8 relative max-w-7xl mx-auto">
        <ConfirmModal 
            isOpen={!!orderToComplete}
            title="Completar Pedido"
            description="¿Confirmas que el pedido ha sido entregado correctamente al cliente?"
            confirmText="Completado"
            onConfirm={() => { if (orderToComplete) updateOrderStatus(orderToComplete, 'COMPLETADO'); }}
            onClose={() => setOrderToComplete(null)}
            type="success"
        />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface-container/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Navigation size={120} />
            </div>
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter mb-2">Atención y Reparto</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{deliveryOrders.length} pedidos activos</p>
            </div>
            <div className="bg-green-500/10 px-5 py-3 rounded-2xl border border-green-500/20 flex items-center gap-3 relative z-10 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-black uppercase text-green-400 tracking-[0.2em]">En Línea</span>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                {deliveryOrders.map(order => (
                    <div key={order.id} className="bg-surface-container rounded-[2rem] overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all group shadow-xl hover:shadow-[0_10px_40px_rgba(225,184,70,0.1)]">
                        <div className="p-8 bg-surface-base/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent"></div>
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl text-black flex items-center justify-center text-2xl font-black shadow-lg ${order.type === 'DOMICILIO' ? 'bg-brand-secondary shadow-[0_0_20px_rgba(255,179,177,0.3)]' : 'bg-brand-primary shadow-[0_0_20px_rgba(225,184,70,0.3)]'}`}>
                                    {order.type === 'DOMICILIO' ? <Package size={28} /> : <ShoppingBag size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-display font-black text-white tracking-tight">#{order.id}</h3>
                                    <p className={`text-xs font-bold uppercase tracking-[0.2em] mt-1 ${order.status === 'LISTO' ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-gray-400'}`}>{order.status}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 items-end w-full md:w-auto mt-4 md:mt-0">
                              <div className="bg-black/40 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-white/5">
                                  <Clock size={16} className="text-brand-primary" /> {order.time}
                              </div>
                              {order.type === 'DOMICILIO' && order.address && (
                                  <button onClick={() => setSelectedOrderAddress(order.address!)} className="text-brand-secondary text-xs uppercase font-black hover:text-white transition-colors flex items-center gap-1 tracking-widest bg-brand-secondary/10 px-4 py-2 rounded-lg border border-brand-secondary/20 hover:bg-brand-secondary/20"><Navigation size={14} /> Ver Ruta</button>
                              )}
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <UserCircle className="text-brand-primary" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg text-white mb-1">{order.customer}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.phone || 'Sin teléfono'}</p>
                                    </div>
                                </div>
                                {order.type === 'DOMICILIO' && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="text-brand-secondary" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-white mb-1">{order.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-surface-base/50 rounded-2xl p-6 border border-white/5 space-y-4 flex flex-col justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4">Resumen del Pedido</p>
                                    <ul className="text-sm font-bold space-y-2 mt-2 mb-4 text-gray-300">
                                        {order.items.map((it, idx) => (
                                            <li key={idx} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></span> {it}</li>
                                        ))}
                                    </ul>
                                </div>
                                {(order.status === 'LISTO' || order.status === 'EN_REPARTO') && (
                                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                        {order.status === 'LISTO' && order.type === 'DOMICILIO' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'EN_REPARTO')} className="w-full bg-brand-secondary text-black font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,179,177,0.2)] uppercase tracking-wider text-sm flex justify-center items-center gap-2">
                                                <Navigation size={18} /> Iniciar Reparto
                                            </button>
                                        )}
                                        <button onClick={() => setOrderToComplete(order.id)} className="w-full bg-brand-primary text-black font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(225,184,70,0.2)] uppercase tracking-wider text-sm flex justify-center items-center gap-2">
                                            <Check size={18} /> Entregado
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {deliveryOrders.length === 0 && (
                    <div className="text-center p-20 bg-surface-container rounded-[2rem] border border-white/10 border-dashed flex flex-col items-center shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                        <Package size={64} className="text-gray-600 mb-6 drop-shadow-lg" />
                        <h3 className="text-3xl font-display font-black text-gray-400 mb-2 tracking-tight">Todo repartido</h3>
                        <p className="text-sm font-bold text-gray-500 max-w-sm uppercase tracking-widest">No hay pedidos pendientes de reparto o recogida en este momento.</p>
                    </div>
                )}
            </div>

            <div className="bg-surface-container rounded-3xl overflow-hidden border border-white/10 h-[600px] xl:sticky xl:top-8 flex flex-col">
              <div className="p-4 bg-white/5 border-b border-white/5">
                <h3 className="font-display font-black text-xl">Mapa de Reparto</h3>
                {selectedOrderAddress ? (
                  <p className="text-sm text-gray-400">Ruta a: {selectedOrderAddress}</p>
                ) : (
                  <p className="text-sm text-gray-400">Selecciona un pedido para ver la ruta desde la tienda.</p>
                )}
              </div>
              <div className="flex-1 relative bg-black/50">
                  {hasValidKey ? (
                      <Map
                        defaultCenter={{lat: 39.852, lng: -0.155}} 
                        defaultZoom={13}
                        mapId="DELIVERY_ROUTE_MAP"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{width: '100%', height: '100%'}}
                        disableDefaultUI={true}
                      >
                        {!selectedOrderAddress && (
                            <AdvancedMarker position={{lat: 39.852, lng: -0.155}}>
                                <Pin background="#ef4444" glyphColor="#fff" />
                            </AdvancedMarker>
                        )}
                        {selectedOrderAddress && (
                          <RouteDisplay origin={OriginLocation} destination={selectedOrderAddress} />
                        )}
                      </Map>
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                          <MapPin size={48} className="mb-4 opacity-50" />
                          <p className="font-bold">El mapa no está disponible ahora mismo</p>
                          <p className="text-xs mt-2 uppercase tracking-widest max-w-xs">Configurando entorno</p>
                      </div>
                  )}
              </div>
            </div>
        </div>
    </div>
    );
};

const Cart = () => {
    const { cart, removeFromCart, updateCartItem, clearCart, addOrder, storeSettings } = useStore();
    const { user, role, getUserByPhone, updateUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check for pre-filled customer data from location state
    const prefillPhone = location.state?.customerPhone || (user ? user.phone : '');
    const prefillName = location.state?.customerName || (user ? user.name : '');
    const prefillAddress = location.state?.customerAddress || (user?.address || '');
    const prefillTable = sessionStorage.getItem('restaurantTable') || '';

    const [orderType, setOrderType] = React.useState<'DOMICILIO' | 'RECOGIDA' | 'MESA'>(prefillTable ? 'MESA' : (prefillAddress ? 'DOMICILIO' : 'MESA'));
    const [customer, setCustomer] = React.useState(prefillName);
    const [phone, setPhone] = React.useState(prefillPhone);
    const [address, setAddress] = React.useState(prefillAddress);
    const [table, setTable] = React.useState(prefillTable);
    const [phoneFound, setPhoneFound] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState<'EFECTIVO' | 'TARJETA' | 'PAYPAL' | 'BIZUM'>('EFECTIVO');
    const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
    const [actionMessage, setActionMessage] = React.useState<{type: 'error' | 'success', text: string} | null>(null);
    const resolvePaymentRef = React.useRef<(v: boolean) => void>(() => {});
    const [paymentSimMethod, setPaymentSimMethod] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    React.useEffect(() => {
        if (['ENCARGADO', 'JEFE', 'CAMARERO'].includes(role) && phone.length >= 6) {
            const existingUser = getUserByPhone(phone);
            if (existingUser) {
                setPhoneFound(true);
                setCustomer(existingUser.name);
                if (existingUser.address) setAddress(existingUser.address);
            } else {
                setPhoneFound(false);
            }
        } else {
            setPhoneFound(false);
        }
    }, [phone, role, getUserByPhone]);

    const targetUser = getUserByPhone(phone);
    const welcomeDiscountEligible = targetUser ? (targetUser.verified && !targetUser.hasUsedWelcomeCoupon) : false;

    const subtotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
    const discountAmount = welcomeDiscountEligible ? subtotal * 0.10 : 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const deliveryFee = orderType === 'DOMICILIO' ? 2.50 : 0;
    const total = subtotalAfterDiscount + deliveryFee;

    const handleSubmit = async () => {
        if (!customer) return setActionMessage({ type: 'error', text: "Falta el nombre del cliente" });
        if (orderType === 'DOMICILIO' && !address) return setActionMessage({ type: 'error', text: "Falta la dirección de envío" });
        if (orderType === 'MESA' && !table) return setActionMessage({ type: 'error', text: "Falta el número de mesa" });
        if (cart.length === 0) return setActionMessage({ type: 'error', text: "No hay productos en el pedido" });

        if (paymentMethod !== 'EFECTIVO') {
            setIsProcessingPayment(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsProcessingPayment(false);
            
            const isConfirmed = await new Promise<boolean>(resolve => {
                resolvePaymentRef.current = resolve;
                setPaymentSimMethod(paymentMethod);
            });
            setPaymentSimMethod(null);
            
            if (!isConfirmed) {
                setActionMessage({ type: 'error', text: 'El pago ha sido cancelado o ha fallado.' });
                return;
            }
        }

        const newOrder = {
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            customer,
            phone,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now(),
            items: cart.map(c => `${c.quantity}x ${c.menuItem.name}${c.notes ? ` (${c.notes})` : ''}`),
            status: 'PENDIENTE' as const,
            type: orderType,
            total,
            address,
            table,
            paymentMethod
        };
        addOrder(newOrder);
        
        // Mark coupon as used if applied
        if (welcomeDiscountEligible && targetUser && updateUser) {
            updateUser(targetUser.id, { hasUsedWelcomeCoupon: true });
        }
        
        // Trigger Push Notification for incoming order
        if (phone && storeSettings?.vapidKey && storeSettings?.vapidPrivateKey) {
            fetch('/api/push/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    vapidKey: storeSettings.vapidKey,
                    vapidPrivateKey: storeSettings.vapidPrivateKey,
                    title: '¡Pedido Recibido!',
                    body: `Estamos preparando tu pedido #${newOrder.id}.`
                })
            }).catch(console.error);
        }

        clearCart();
        setActionMessage({ type: 'success', text: "¡Pedido enviado a cocina!" });

        if (['ENCARGADO', 'JEFE', 'CAMARERO'].includes(role)) {
            setCustomer('');
            setPhone('');
            setAddress('');
            setTable('');
        }
    };

    return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-right-5 duration-500 relative">
        <AnimatePresence>
            {actionMessage && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold shadow-2xl backdrop-blur-md border ${actionMessage.type === 'error' ? 'bg-brand-red/90 text-white border-brand-red' : 'bg-green-500/90 text-white border-green-400'}`}
                >
                    {actionMessage.text}
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {paymentSimMethod && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-surface-container-high p-8 rounded-3xl border border-white/10 max-w-sm w-full text-center shadow-2xl"
                    >
                        <ShoppingCart size={48} className="mx-auto mb-4 text-brand-primary" />
                        <h3 className="text-2xl font-display font-black text-white mb-2">Simulación de Pago</h3>
                        <p className="text-gray-400 mb-6 font-bold">Pasarela virtual para <span className="text-brand-primary">{paymentSimMethod}</span>.<br/>Total a cobrar: <span className="text-white">€{total.toFixed(2)}</span></p>
                        <div className="flex gap-4">
                            <button onClick={() => resolvePaymentRef.current(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-brand-red/20 text-gray-400 hover:text-brand-red transition-colors font-bold">
                                Fallar Pago
                            </button>
                            <button onClick={() => resolvePaymentRef.current(true)} className="flex-1 py-3 rounded-xl bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-black transition-colors font-black">
                                Simular Éxito
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center">
                <ShoppingCart size={24} />
            </div>
            <div>
               <h2 className="text-4xl font-display font-black text-white tracking-tighter">Revisar Pedido</h2>
               <p className="text-sm text-brand-primary font-bold mt-1 uppercase tracking-[0.2em]">Caja • Mamma Mia!</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-surface-container rounded-3xl p-2 flex border border-white/5">
                    <button onClick={() => setOrderType('MESA')} className={`flex-1 py-4 font-black uppercase text-xs rounded-2xl transition-all ${orderType === 'MESA' ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'}`}>En Mesa</button>
                    <button onClick={() => setOrderType('RECOGIDA')} className={`flex-1 py-4 font-black uppercase text-xs rounded-2xl transition-all ${orderType === 'RECOGIDA' ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'}`}>Recoger</button>
                    <button onClick={() => setOrderType('DOMICILIO')} className={`flex-1 py-4 font-black uppercase text-xs rounded-2xl transition-all ${orderType === 'DOMICILIO' ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'}`}>A Domicilio</button>
                </div>

                <div className="bg-surface-container rounded-3xl p-6 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black">Datos del Cliente</h3>
                        {!user && role === 'CLIENTE' && (
                            <button onClick={() => navigate('/login')} className="text-xs font-bold text-brand-primary hover:text-brand-yellow px-3 py-1.5 bg-brand-primary/10 rounded-lg transition-colors">
                                Crear cuenta o iniciar sesión
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Teléfono</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-brand-primary transition-colors" placeholder="Teléfono" />
                            {phoneFound && <span className="text-[10px] text-green-400 font-bold mt-1 block">✓ Cliente encontrado en la base de datos</span>}
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Nombre</label>
                            <input value={customer} onChange={e => setCustomer(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-brand-primary transition-colors" placeholder="Nombre completo" />
                        </div>
                        {orderType === 'DOMICILIO' && (
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Dirección</label>
                                {user?.savedAddresses && user.savedAddresses.length > 0 && (
                                    <div className="flex gap-2 mb-3 flex-wrap">
                                        {user.savedAddresses.map((addr, idx) => (
                                            <button key={idx} type="button" onClick={() => setAddress(addr)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-gray-300 transition-colors">
                                                ★ {addr}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <AddressAutocomplete 
                                    value={address} 
                                    onChange={setAddress} 
                                    onAddressSelect={(addr) => {
                                        if (!addr.toLowerCase().includes('nules')) {
                                            alert("Solo hacemos repartos a domicilio en la zona de Nules. Para otras localidades, selecciona 'Para Recoger'.");
                                            setOrderType('RECOGIDA'); 
                                        }
                                        setAddress(addr);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-brand-primary transition-colors" 
                                    placeholder="Calle, Número, Piso (Ej: Nules)..." 
                                />
                            </div>
                        )}
                        {orderType === 'MESA' && (
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Número de Mesa</label>
                                <input value={table} onChange={e => setTable(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-brand-primary transition-colors" placeholder="Ej. Mesa 4" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.menuItem.id} className="bg-surface-container rounded-3xl p-6 flex flex-col gap-4 border border-white/5 hover:border-brand-primary/20 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                    {item.menuItem.image ? (
                                        <img src={`${item.menuItem.image}?q=80&w=200&auto=format&fit=crop`} alt={item.menuItem.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500 font-bold uppercase text-xs">Sin img</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-black uppercase text-white truncate pr-4">{item.menuItem.name}</h3>
                                        <button onClick={() => removeFromCart(item.menuItem.id)} className="text-gray-600 hover:text-brand-red transition-all">
                                            <ShoppingCart size={18} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-display font-black text-brand-yellow">€{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                                        <div className="flex items-center gap-4 bg-black/40 rounded-full px-4 py-2 border border-white/5 shadow-inner">
                                            <button onClick={() => updateCartItem(item.menuItem.id, Math.max(1, item.quantity - 1))} className="text-gray-400 hover:text-white transition-colors font-bold text-lg">-</button>
                                            <span className="font-black w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateCartItem(item.menuItem.id, item.quantity + 1)} className="text-gray-400 hover:text-brand-primary transition-colors font-bold text-lg">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-sm">
                                <textarea 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-gray-300 outline-none focus:border-brand-primary transition-colors resize-none placeholder-gray-600"
                                    rows={2}
                                    placeholder="Notas de preparación (ej. sin cebolla, muy hecho...)"
                                    value={item.notes || ''}
                                    onChange={(e) => updateCartItem(item.menuItem.id, item.quantity, e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="text-center p-16 bg-surface-container rounded-3xl border border-white/5 border-dashed">
                            <ShoppingCart size={48} className="mx-auto mb-4 text-brand-primary opacity-50" />
                            <h4 className="text-xl font-bold text-white mb-2">Tu pedido está vacío</h4>
                            <p className="text-gray-400 mb-6 max-w-sm mx-auto">Vuelve a la carta y anade los platos que más te apetezcan para completar tu pedido.</p>
                            <button onClick={() => navigate('/')} className="bg-brand-primary text-black font-black uppercase text-xs px-6 py-3 rounded-xl hover:scale-105 transition-transform">
                                Ver Carta
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24">
                <div className="bg-surface-container-high rounded-3xl p-8 border border-white/10 space-y-8 shadow-2xl">
                    <h3 className="text-xl font-black border-b border-white/5 pb-4">Resumen</h3>
                    <div className="space-y-4 font-bold text-sm">
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <span className="text-gray-400">Método de pago</span>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setPaymentMethod('EFECTIVO')} className={`py-3 rounded-xl border transition-all ${paymentMethod === 'EFECTIVO' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary' : 'bg-surface-base text-gray-400 border-white/10 hover:border-white/20'}`}>
                                    Efectivo
                                </button>
                                <button onClick={() => setPaymentMethod('TARJETA')} className={`py-3 rounded-xl border transition-all ${paymentMethod === 'TARJETA' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary' : 'bg-surface-base text-gray-400 border-white/10 hover:border-white/20'}`}>
                                    Tarjeta
                                </button>
                                <button onClick={() => setPaymentMethod('PAYPAL')} className={`py-3 rounded-xl border transition-all ${paymentMethod === 'PAYPAL' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary' : 'bg-surface-base text-gray-400 border-white/10 hover:border-white/20'}`}>
                                    PayPal
                                </button>
                                <button onClick={() => setPaymentMethod('BIZUM')} className={`py-3 rounded-xl border transition-all ${paymentMethod === 'BIZUM' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary' : 'bg-surface-base text-gray-400 border-white/10 hover:border-white/20'}`}>
                                    Bizum
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>€{subtotal.toFixed(2)}</span>
                        </div>
                        {welcomeDiscountEligible && (
                            <div className="flex justify-between text-brand-primary">
                                <span>Descuento de Bienvenida (10%)</span>
                                <span>-€{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        {orderType === 'DOMICILIO' && (
                            <div className="flex justify-between text-gray-500">
                                <span>Coste de Envío</span>
                                <span>€{deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-white pt-4 border-t border-white/5">
                            <span className="text-lg">Total</span>
                            <span className="text-2xl font-display font-black text-brand-primary">€{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <button onClick={handleSubmit} disabled={isProcessingPayment} className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl shadow-[0_0_30px_#ffe4af40] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100">
                        {isProcessingPayment ? 'Procesando Pago...' : 'Enviar a Cocina'}
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};

const Kitchen = () => {
    const { orders, updateOrderStatus } = useStore();
    const [now, setNow] = React.useState(Date.now());
    
    React.useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const pendingOrders = [...orders].filter(o => o.status === 'PENDIENTE' || o.status === 'PREPARANDO').sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'PREPARANDO' ? -1 : 1;
    });

    return (
    <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex justify-between items-center bg-surface-container border border-white/5 p-6 rounded-2xl">
        <div>
          <h2 className="text-4xl font-display font-black text-brand-secondary">Sistema de Cocina KDS</h2>
          <p className="text-gray-400 font-bold">Chef Marco Rossi • Cola en vivo</p>
        </div>
        <div className="text-center">
            <span className="block text-4xl font-display font-black text-brand-yellow">{pendingOrders.length}</span>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pendientes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
        {pendingOrders.map(order => {
            const isLate = order.status === 'PENDIENTE' && (now - (order.createdAt || now)) > 10 * 60000;
            return (
            <motion.div 
                layout
                initial={{ opacity: 0, x: -40, scale: 0.95 }}
                animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: order.status === 'PREPARANDO' ? [0.95, 1] : 1,
                    filter: order.status === 'PREPARANDO' ? ['brightness(1.5)', 'brightness(1)'] : 'brightness(1)'
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                key={order.id} 
                className={`bg-surface-container rounded-3xl p-6 border-l-4 ${order.type === 'DOMICILIO' ? 'border-brand-secondary' : order.type === 'MESA' ? 'border-brand-primary' : 'border-white'} flex flex-col justify-between shadow-2xl relative overflow-hidden group ${order.status === 'PREPARANDO' ? 'ring-2 ring-brand-secondary ring-offset-4 ring-offset-surface-base' : isLate ? 'animate-[pulse_1.5s_ease-in-out_infinite] bg-red-950/40 border-l-red-500 ring-2 ring-red-500/50 ring-offset-4 ring-offset-surface-base' : ''}`}
            >
               <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors ${order.type === 'DOMICILIO' ? 'bg-brand-secondary/5 group-hover:bg-brand-secondary/10' : order.type === 'MESA' ? 'bg-brand-primary/5 group-hover:bg-brand-primary/10' : 'bg-white/5 group-hover:bg-white/10'}`}></div>
               <div>
                  <div className="flex flex-col mb-6 border-b border-white/5 pb-4 gap-2">
                    <div className="flex justify-between items-start">
                        <span className="text-2xl font-display font-black text-white">#{order.id}</span>
                        <div className="text-right">
                           <span className="text-white font-black text-sm block">{order.time}</span>
                           <span className="text-[10px] font-black uppercase text-gray-500">{order.status}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded ${order.type === 'DOMICILIO' ? 'bg-brand-secondary/20 text-brand-secondary' : order.type === 'MESA' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/20 text-white'}`}>
                            {order.type}
                        </span>
                        <div className="flex items-center gap-2">
                             {order.paymentMethod && <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded uppercase">{order.paymentMethod}</span>}
                             {order.table && <span className="text-xs font-bold text-gray-400">Mesa: {order.table}</span>}
                        </div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                      {order.items.map((item, idx) => {
                          const parts = item.split('x ');
                          const qty = parts.length > 1 ? parts[0] + 'x' : '';
                          const name = parts.length > 1 ? parts[1] : item;
                          return (
                              <li key={idx} className="flex gap-4 items-start">
                                 {qty && <span className="bg-white/10 text-white w-6 h-6 rounded flex items-center justify-center font-black shrink-0">{qty.replace('x','')}</span>}
                                 <span className="font-bold text-lg leading-none pt-0.5 text-white">{name}</span>
                              </li>
                          )
                      })}
                  </ul>
               </div>
               {order.status === 'PENDIENTE' ? (
                   <button onClick={() => updateOrderStatus(order.id, 'PREPARANDO')} className="w-full bg-white/10 text-white py-5 md:py-4 rounded-xl font-black uppercase tracking-widest text-sm md:text-base hover:bg-white/20 transition-all active:scale-95 mt-4 border border-white/10">
                      Empezar a Preparar
                   </button>
               ) : (
                   <button onClick={() => updateOrderStatus(order.id, 'LISTO')} className="w-full bg-brand-primary text-black py-5 md:py-4 rounded-xl font-black uppercase tracking-widest text-sm md:text-base hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-4">
                      {order.type === 'MESA' ? 'Enviar a Pedidos' : 'Enviar a Repartos'}
                   </button>
               )}
            </motion.div>
            );
        })}
        </AnimatePresence>
        
        {pendingOrders.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="bg-surface-container/50 border border-white/5 border-dashed rounded-3xl flex items-center justify-center p-12 col-span-full"
            >
                <p className="text-gray-500 font-black uppercase tracking-widest text-sm text-center">No hay más pedidos <br/><span className="text-5xl my-4 block">🍳</span> ¡Buen ritmo!</p>
            </motion.div>
        )}
      </div>
    </div>
    );
};

import { PushNotificationHistory } from './components/PushNotificationHistory';
import { CustomerImporter } from './components/CustomerImporter';

const StoreSettingsPage = () => {
    const { storeSettings, updateStoreSettings } = useStore();
    const { role } = useAuth();
    const navigate = useNavigate();

    if (role !== 'JEFE' && role !== 'ENCARGADO') {
        return (
            <div className="flex flex-col flex-1 pb-4 gap-4 px-6 md:px-12 w-full max-w-7xl mx-auto h-[60vh] justify-center items-center">
                <span className="material-symbols-outlined text-6xl text-brand-red mb-4">gavel</span>
                <h1 className="text-3xl font-display font-black text-brand-red mb-2 text-center text-balance tracking-tight">Acceso Denegado</h1>
                <p className="text-gray-400 font-bold mb-8 text-center text-balance max-w-md">No tienes los privilegios necesarios para acceder a la configuración de la tienda.</p>
                <button onClick={() => navigate(-1)} className="bg-surface-container border border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors px-6 py-3 rounded-full font-bold">
                    Volver atrás
                </button>
            </div>
        );
    }

    const [formData, setFormData] = React.useState({
        openingHours: storeSettings.openingHours,
        deliveryZones: storeSettings.deliveryZones.join(', '),
        deliveryFee: storeSettings.deliveryFee,
        contactPhone: storeSettings.contactPhone,
        vapidKey: storeSettings.vapidKey || '',
        vapidPrivateKey: storeSettings.vapidPrivateKey || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'deliveryFee' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        updateStoreSettings({
            openingHours: formData.openingHours,
            deliveryZones: formData.deliveryZones.split(',').map(z => z.trim()).filter(Boolean),
            deliveryFee: formData.deliveryFee,
            contactPhone: formData.contactPhone,
            vapidKey: formData.vapidKey,
            vapidPrivateKey: formData.vapidPrivateKey
        });
        
        alert('Configuración guardada correctamente.');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-surface-container/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Settings size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-[0_0_20px_rgba(225,184,70,0.15)]">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter">Ajustes de Tienda</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Configuración operativa</p>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-surface-container rounded-[2rem] p-10 border border-white/5 space-y-8 shadow-xl relative overflow-hidden">
                <h3 className="text-xl font-black text-brand-primary uppercase tracking-[0.2em] border-b border-white/5 pb-4">General</h3>
                
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                        Horario de Apertura
                    </label>
                    <input 
                        type="text" 
                        name="openingHours"
                        value={formData.openingHours}
                        onChange={handleChange}
                        className="w-full bg-surface-base border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white font-bold transition-all shadow-inner"
                        placeholder="Ej. 12:00 - 16:00, 19:30 - 23:30"
                    />
                </div>
                
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                        Zonas de Reparto (separadas por coma)
                    </label>
                    <textarea 
                        name="deliveryZones"
                        value={formData.deliveryZones}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-surface-base border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white font-bold transition-all resize-none shadow-inner"
                        placeholder="Centro, Norte, Sur"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                            Gastos de Envío (€)
                        </label>
                        <input 
                            type="number" 
                            name="deliveryFee"
                            value={formData.deliveryFee === 0 ? '' : formData.deliveryFee}
                            step="0.10"
                            onChange={handleChange}
                            className="w-full bg-surface-base border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white font-bold transition-all shadow-inner"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                            Teléfono de Contacto
                        </label>
                        <input 
                            type="text" 
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="w-full bg-surface-base border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white font-bold transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                        Clave VAPID Pública (Para Notificaciones Push)
                    </label>
                    <input 
                        type="text" 
                        name="vapidKey"
                        value={formData.vapidKey}
                        onChange={handleChange}
                        className="w-full bg-surface-base border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white font-bold transition-all shadow-inner mb-2"
                        placeholder="B... (Clave VAPID pública)"
                    />
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 mt-4">
                        Clave VAPID Privada
                    </label>
                    <input 
                        type="password" 
                        name="vapidPrivateKey"
                        value={formData.vapidPrivateKey}
                        onChange={handleChange}
                        className="w-full bg-surface-base border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white font-bold transition-all shadow-inner"
                        placeholder="... (Clave VAPID privada)"
                    />
                    <div className="flex gap-4 mt-4">
                        <button 
                            type="button" 
                            onClick={async () => {
                                try {
                                    const res = await fetch('/api/push/generate-keys');
                                    const keys = await res.json();
                                    setFormData(f => ({ ...f, vapidKey: keys.publicKey, vapidPrivateKey: keys.privateKey }));
                                    alert('Claves generadas, recuerda Guardar Ajustes.');
                                } catch (e) {
                                    alert('Error generando claves');
                                }
                            }}
                            className="bg-zinc-800 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-zinc-700 transition"
                        >
                            Generar Nuevas Claves VAPID
                        </button>
                        <button 
                            type="button" 
                            onClick={async () => {
                                if (!formData.vapidKey || !formData.vapidPrivateKey) {
                                    alert('Debe guardar primero la clave VAPID pública y privada.');
                                    return;
                                }
                                try {
                                    const res = await fetch('/api/push/test', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                            vapidKey: formData.vapidKey,
                                            vapidPrivateKey: formData.vapidPrivateKey
                                        })
                                    });
                                    const data = await res.json();
                                    alert(`Prueba enviada: ${data.successCount} recibidas, ${data.failureCount} fallidas.`);
                                } catch (e) {
                                    alert('Error enviando prueba');
                                }
                            }}
                            className="bg-brand-primary/20 border border-brand-primary/50 text-brand-primary font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-brand-primary/30 transition"
                        >
                            Enviar Notificación de Prueba a Todos
                        </button>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-end">
                    <button type="submit" className="bg-brand-primary text-black font-black uppercase tracking-[0.2em] px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(225,184,70,0.3)]">
                        Guardar Ajustes
                    </button>
                </div>
            </form>

            <div className="mt-12 pt-12 border-t border-white/5 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10">
                        <Users size={24} />
                    </div>
                    <h2 className="text-3xl font-display font-black tracking-tight text-white">Base de Datos de Clientes</h2>
                </div>
                <CustomerImporter />
            </div>
        </div>
    );
};

const QRCodes = () => {
    const { role } = useAuth();
    const [numTables, setNumTables] = React.useState(15);

    if (!['JEFE', 'ENCARGADO'].includes(role)) {
        return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
    }

    const tables = Array.from({ length: numTables }, (_, i) => i + 1);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container border border-white/5 p-8 rounded-3xl gap-6">
                <div>
                    <h2 className="text-4xl font-display font-black text-brand-primary">Códigos QR de Mesas</h2>
                    <p className="text-gray-400 font-bold mt-2">Genera códigos QR únicos para que los clientes escaneen desde su mesa.</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="font-bold text-sm text-gray-400 uppercase">Total Mesas</span>
                    <input 
                        type="number" 
                        value={numTables} 
                        onChange={(e) => setNumTables(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-black text-white w-20 px-3 py-2 rounded-lg font-mono text-center border border-white/10 focus:outline-none focus:border-brand-primary"
                        min="1"
                        max="100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map(table => {
                    const qrUrl = `${window.location.origin}/mesa/${table}`;
                    return (
                        <div key={table} className="bg-surface-container rounded-3xl p-6 border border-white/5 flex flex-col items-center shadow-xl group hover:border-brand-primary/50 transition-colors">
                            <h3 className="text-2xl font-display font-black text-white mb-6">Mesa <span className="text-brand-primary">{table}</span></h3>
                            <div id={`qr-${table}`} className="bg-white p-4 rounded-2xl mb-6 shadow-inner relative group-hover:scale-105 transition-transform">
                                <QRCodeSVG 
                                    value={qrUrl} 
                                    size={160} 
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"Q"}
                                    includeMargin={false}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-2xl cursor-pointer">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(qrUrl);
                                            alert(`Enlace de Mesa ${table} copiado: ${qrUrl}`);
                                        }}
                                        className="bg-black text-white font-bold px-4 py-2 rounded-xl text-xs uppercase"
                                    >Copiar Enlace</button>
                                </div>
                            </div>
                            <div className="text-center w-full">
                                <p className="text-[10px] text-gray-500 font-bold break-all">{qrUrl}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex justify-center mt-12 mb-12">
                <button 
                    onClick={() => window.print()}
                    className="bg-brand-primary text-black font-black uppercase text-sm px-8 py-4 rounded-xl border-b-4 border-black/20 hover:bg-brand-yellow transition-colors flex items-center gap-3"
                >
                    <Printer className="w-5 h-5" /> Imprimir Códigos
                </button>
            </div>
        </div>
    );
};

const TableRedirect = () => {
    const { tableNumber } = useParams();
    const navigate = useNavigate();
    
    React.useEffect(() => {
        if (tableNumber) {
            sessionStorage.setItem('restaurantTable', tableNumber);
        }
        navigate('/', { replace: true });
    }, [tableNumber, navigate]);
    
    return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore */}
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<PageWrapper><Menu /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/inventory" element={<PageWrapper><Inventory /></PageWrapper>} />
          <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
          <Route path="/kitchen" element={<PageWrapper><Kitchen /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/clock" element={<PageWrapper><ClockIn /></PageWrapper>} />
          <Route path="/delivery" element={<PageWrapper><Delivery /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
          <Route path="/cms" element={<PageWrapper><CMS /></PageWrapper>} />
          <Route path="/qr" element={<PageWrapper><QRCodes /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><StoreSettingsPage /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/mesa/:tableNumber" element={<TableRedirect />} />
        <Route path="/cliente" element={<PageWrapper><AppCliente /></PageWrapper>} />
        <Route path="/tauleta" element={<PageWrapper><TauletaApp /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminApp /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default function App() {
  if (!hasValidKey) {
    return (
      <AuthProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </AuthProvider>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <AuthProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </AuthProvider>
    </APIProvider>
  );
}
