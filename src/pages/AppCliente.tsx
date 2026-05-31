import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Mic, Send, ChefHat, MapPin, ChevronRight, Plus, Minus, Sparkles, Loader2, Check, AlertCircle, CheckCircle, Search, X, LayoutGrid, List } from 'lucide-react';
import { dbService } from '../db/DatabaseService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { PizzaTracker } from '../components/PizzaTracker';
import { NotificationManager } from '../components/NotificationManager';

const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="text-brand-primary bg-brand-primary/10 rounded px-0.5">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

export const AppCliente = () => {
    const { orders, addOrder, menuItems: products, categories } = useStore();
    const [cart, setCart] = useState<{product: any, qty: number, notes?: string}[]>([]);
    const [orderText, setOrderText] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<{ reply: string, parsedItems: any[] } | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
    
    const { user, login } = useAuth();
    const navigate = useNavigate();

    // Check for an active order to show the tracker
    const activeOrder = useMemo(() => {
        if (!user) return null;
        // Find most recent order by this user that is NOT completed
        const active = orders.find(o => o.phone === user.phone && o.status !== 'COMPLETADO');
        return active;
    }, [orders, user]);

    // Box Customization
    const [boxCustomizing, setBoxCustomizing] = useState<any>(null);
    const [boxPizza, setBoxPizza] = useState<string>('');
    const [boxSide, setBoxSide] = useState<string>('Patatas');
    const [boxDrink, setBoxDrink] = useState<string>('');
    const [boxSnack, setBoxSnack] = useState<string>('');
    
    const handleAddBox = () => {
        if (!boxPizza || !boxSide || !boxDrink || !boxSnack) {
            alert('Por favor selecciona todas las opciones del menú The Box.');
            return;
        }
        const extraPrice = boxSide === 'Ensalada' ? 2 : 0;
        const notes = `The Box: Pizza ${boxPizza}, ${boxSide}, Bebida: ${boxDrink}, Aperitivo: ${boxSnack}`;
        addToCart(boxCustomizing, notes, extraPrice);
        setBoxCustomizing(null);
        setBoxPizza('');
        setBoxSide('Patatas');
        setBoxDrink('');
        setBoxSnack('');
    };

    const addToCart = (product: any, notes?: string, customPriceOffset: number = 0) => {
        setCart(prev => {
            const existing = prev.find(p => p.product.id === product.id && p.notes === notes);
            if (existing) {
                return prev.map(p => (p.product.id === product.id && p.notes === notes) ? {...p, qty: p.qty + 1} : p);
            }
            const actualProduct = customPriceOffset ? { ...product, price: product.price + customPriceOffset } : product;
            return [...prev, {product: actualProduct, qty: 1, notes}];
        });
    };

    const removeFromCart = (productId: string, notes?: string) => {
        setCart(prev => {
            const existing = prev.find(p => p.product.id === productId && p.notes === notes);
            if (existing && existing.qty > 1) {
                return prev.map(p => (p.product.id === productId && p.notes === notes) ? {...p, qty: p.qty - 1} : p);
            }
            return prev.filter(p => !(p.product.id === productId && p.notes === notes));
        });
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
    const cartItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (cart.length === 0) return;

        const itemsStringList = cart.map(item => {
            if (item.notes) return item.notes;
            const qtyS = item.qty > 1 ? `${item.qty}x ` : '';
            return `${qtyS}${item.product.name}`;
        });

        // Add order via Zustand (Firebase synched)
        addOrder({
            id: Date.now().toString(),
            customer: user.name || 'Cliente Online',
            phone: user.phone,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now(),
            items: itemsStringList,
            status: 'PENDIENTE',
            type: 'MESA', // Note: En la app cliente se asume mesa por defecto a menos que se cambie
            total: cartTotal,
        });
        
        setCart([]);
        setIsCartOpen(false);
        setSuccessMessage('¡Pedido realizado con éxito! Enviado directamente a la cocina de Mamma Mia.');
        setIsSuccessModalOpen(true);
    };

    const matchProductByName = (parsedName: string) => {
        return products.find(p => 
            p.name.toLowerCase().includes(parsedName.toLowerCase()) ||
            parsedName.toLowerCase().includes(p.name.toLowerCase())
        );
    };

    const handleAIAssist = async () => {
        if (!orderText.trim()) return;
        setIsAILoading(true);
        setAiResponse(null);
        try {
            const menuData = products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                description: p.description
            }));

            const response = await fetch('/api/gemini/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preferences: orderText,
                    menuData: menuData
                })
            });

            if (!response.ok) {
                throw new Error('La IA no pudo procesar tu pedido.');
            }

            const data = await response.json();
            
            // Collect all items parsed by Gemini
            const allItems: any[] = [];
            if (data.order) {
                if (Array.isArray(data.order.pizzas)) allItems.push(...data.order.pizzas);
                if (Array.isArray(data.order.bebidas)) allItems.push(...data.order.bebidas);
                if (Array.isArray(data.order.otros)) allItems.push(...data.order.otros);
            }

            setAiResponse({
                reply: data.reply || 'He procesado tu pedido.',
                parsedItems: allItems
            });
            setOrderText('');
        } catch (error) {
            console.error(error);
            setAiResponse({
                reply: 'El Chef de Mamma Mia está un poco ocupado ahora mismo. Intenta pedir manualmente o escríbeme en unos instantes.',
                parsedItems: []
            });
        } finally {
            setIsAILoading(false);
        }
    };

    const addAiItemsToCart = () => {
        if (!aiResponse) return;
        
        setCart(prev => {
            let nextCart = [...prev];
            aiResponse.parsedItems.forEach(item => {
                const product = matchProductByName(item.name);
                if (product) {
                    const existingIdx = nextCart.findIndex(p => p.product.id === product.id);
                    const qtyToAdd = Number(item.qty) || 1;
                    if (existingIdx > -1) {
                        nextCart[existingIdx] = {
                            ...nextCart[existingIdx],
                            qty: nextCart[existingIdx].qty + qtyToAdd
                        };
                    } else {
                        nextCart.push({ product, qty: qtyToAdd });
                    }
                }
            });
            return nextCart;
        });

        setSuccessMessage('¡Genial! Los productos sugeridos por la IA se han añadido a tu carrito correctamente.');
        setIsSuccessModalOpen(true);
        setAiResponse(null);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1c0a06] via-surface-base to-black flex items-center justify-center py-0 sm:py-8 px-0 sm:px-4 overflow-hidden relative">
            {/* Background design ornaments for desktop */}
            <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none hidden md:block" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-brand-red/5 blur-[120px] pointer-events-none hidden md:block" />

            {/* Side info panel on desktop/large screens */}
            <div className="hidden lg:flex fixed left-10 xl:left-24 top-1/2 -translate-y-1/2 flex-col max-w-xs xl:max-w-sm z-10">
                <span className="text-brand-primary font-black uppercase tracking-[0.3em] text-xs">La Nostra Pizza</span>
                <h1 className="text-5xl xl:text-7xl font-display font-black text-white leading-none mt-2 mb-6">Mamma Mia!</h1>
                <p className="text-gray-400 font-bold text-sm leading-relaxed">
                    Pide cómodamente desde tu mesa, consulta al Chef Inteligente con IA o haz tu pedido para recoger. ¡Y no olvides usar tu cupón del 10%!
                </p>
                <div className="flex gap-4 items-center mt-8 bg-surface-container border border-white/5 p-4 rounded-3xl">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black text-2xl border border-brand-primary/20">
                        %
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">10% Descuento</p>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">Automático en tu primer pedido</p>
                    </div>
                </div>
            </div>

            {/* Floating Mobile App Mockup Frame */}
            <div className="w-full max-w-md min-h-screen sm:min-h-[800px] sm:h-[90vh] bg-surface-base text-white font-sans sm:rounded-[2.5rem] relative overflow-y-auto flex flex-col sm:shadow-[0_24px_80px_rgba(0,0,0,0.8)] border-0 sm:border sm:border-white/10 safe-area-pt custom-scrollbar pb-24 shadow-2xl">
                {/* Header */}
            <header className="px-6 top-0 sticky bg-surface-base/80 backdrop-blur-xl z-30 pt-8 pb-4 flex justify-between items-center border-b border-white/5">
                <div>
                     <h1 className="text-2xl font-display font-black text-brand-primary tracking-tight flex items-center gap-2">
                        <ChefHat size={24} /> Mamma Mia
                     </h1>
                     <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-brand-red"/> Nules, Castelló
                     </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-xs font-bold text-gray-400 hover:text-white bg-surface-container border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                        title="Volver"
                    >
                        Salir
                    </button>
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="relative bg-surface-container w-12 h-12 rounded-full flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
                    >
                        <ShoppingCart size={20} className="text-white"/>
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {cartItemsCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Active Order Tracker */}
            {activeOrder && (
                <div className="px-6 mt-6 mb-2">
                    <PizzaTracker orderId={activeOrder.id} />
                </div>
            )}

            {/* AI Ordering Area */}
            <div className="px-6 mt-6 mb-8">
                <div className="bg-gradient-to-r from-brand-blue/10 to-purple-500/10 border border-brand-blue/20 rounded-3xl p-5 shadow-[0_0_30px_rgba(34,107,172,0.1)]">
                    <h2 className="text-sm font-bold text-brand-light-blue mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={16} className="text-brand-yellow animate-pulse" /> Chef Inteligente IA
                    </h2>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors"
                            placeholder="Ej: Quiero una margarita sin cebolla..."
                            value={orderText}
                            onChange={(e) => setOrderText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAIAssist()}
                            disabled={isAILoading}
                        />
                        <button 
                            onClick={handleAIAssist}
                            disabled={isAILoading}
                            className="bg-brand-blue hover:bg-brand-light-blue text-white p-3 rounded-2xl transition-colors active:scale-95 flex items-center justify-center disabled:opacity-50"
                        >
                            {isAILoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>

                    {/* AI Loading State */}
                    {isAILoading && (
                        <div className="mt-4 flex items-center gap-2.5 text-xs text-brand-light-blue bg-brand-blue/5 border border-brand-blue/10 p-3 rounded-xl">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="font-semibold">El Chef de Mamma Mia está procesando tu pedido gastronómico...</span>
                        </div>
                    )}

                    {/* AI Response Block */}
                    {aiResponse && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 bg-surface-bright/85 border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg"
                        >
                            <div className="flex items-start gap-2">
                                <span className="bg-brand-primary text-black p-1.5 rounded-lg text-xs mt-0.5">🤖</span>
                                <p className="text-xs font-bold text-gray-200 leading-relaxed leading-normal">{aiResponse.reply}</p>
                            </div>

                            {aiResponse.parsedItems.length > 0 && (
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-2">Ingredientes identificados en la carta:</p>
                                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                                        {aiResponse.parsedItems.map((item, idx) => {
                                            const match = matchProductByName(item.name);
                                            return (
                                                <div key={idx} className="flex justify-between items-center bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                                                    <div className="flex items-center gap-2 truncate">
                                                        {match ? (
                                                            <Check size={12} className="text-green-500 shrink-0" />
                                                        ) : (
                                                            <AlertCircle size={12} className="text-brand-yellow shrink-0" />
                                                        )}
                                                        <span className="text-xs text-white truncate font-medium">
                                                            {item.qty}x {match ? match.name : item.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 shrink-0 font-bold">
                                                        {match ? `€${(match.price * (item.qty || 1)).toFixed(2)}` : 'No encontrado'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {aiResponse.parsedItems.some(i => matchProductByName(i.name)) && (
                                        <button 
                                            onClick={addAiItemsToCart}
                                            className="w-full mt-3 bg-brand-primary text-black text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:bg-brand-yellow transition-all active:scale-95"
                                        >
                                            <Sparkles size={12} /> Añadir estos artículos al carrito
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            {/* Menu Layout */}
            <div className="px-6 space-y-8">
                {/* Search Bar & View Toggle */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-brand-primary/50" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar pizzas, ingredientes, categorías..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-11 pr-10 py-4 bg-surface-container/60 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all backdrop-blur-md"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                            </button>
                        )}
                    </div>
                    <div className="bg-surface-container/60 border border-white/10 rounded-2xl flex p-1 backdrop-blur-md shrink-0">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'card' ? 'bg-brand-primary text-black scale-105 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            title="Vista Tarjetas"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'compact' ? 'bg-brand-primary text-black scale-105 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            title="Vista Compacta"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {categories.map(category => {
                    const categoryProducts = products.filter(p => p.category === category).filter(p => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return p.name.toLowerCase().includes(query) || 
                               (p.description && p.description.toLowerCase().includes(query)) ||
                               category.toLowerCase().includes(query);
                    });
                    if (categoryProducts.length === 0) return null;
                    return (
                    <div key={category} className="mb-8">
                        <h3 className="text-xl font-display font-black mb-5 tracking-tight text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span>
                            {highlightMatch(category, searchQuery)}
                        </h3>
                        <div className={`grid gap-4 ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {categoryProducts.map(product => {
                                const isPopular = product.isPopular || product.tags?.includes('popular') || product.tags?.includes('premium');
                                const itemImage = product.image;
                                
                                return (
                                    <motion.div 
                                        key={product.id}
                                        className={`bg-surface-container/60 hover:bg-surface-container/90 backdrop-blur-md flex border border-white/5 hover:border-white/10 shadow-lg relative overflow-hidden transition-colors cursor-pointer group ${viewMode === 'compact' ? 'p-3 gap-3 rounded-2xl items-center' : 'rounded-3xl p-4 gap-4'}`}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isPopular && viewMode !== 'compact' && (
                                            <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-primary/20 to-transparent text-[10px] font-black text-brand-primary px-3 py-1 bg-black/40 rounded-bl-xl border-l border-b border-white/5 uppercase tracking-widest z-10">
                                                Premium 🔥
                                            </div>
                                        )}
                                        <div className={`bg-black/35 flex-shrink-0 flex items-center justify-center border border-white/5 overflow-hidden relative shadow-inner ${viewMode === 'compact' ? 'w-14 h-14 rounded-xl' : 'w-24 h-24 rounded-2xl'}`}>
                                             {itemImage ? (
                                                <img src={itemImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 menu-item-image" />
                                             ) : (
                                                <ChefHat size={viewMode === 'compact' ? 24 : 32} className="text-gray-600 opacity-40"/>
                                             )}
                                        </div>
                                        <div className={`flex-1 flex ${viewMode === 'compact' ? 'flex-row items-center justify-between gap-4 min-w-0' : 'flex-col justify-between py-1 relative min-w-0'}`}>
                                            <div className={`${viewMode === 'compact' ? 'flex-1 min-w-0 pr-2' : ''}`}>
                                                <h4 className={`font-bold text-white text-sm leading-tight tracking-tight ${viewMode === 'compact' ? 'truncate pr-0' : 'pr-14 break-words'}`}>
                                                    {highlightMatch(product.name, searchQuery)}
                                                    {isPopular && viewMode === 'compact' && <span className="ml-2 text-[10px] text-brand-primary tracking-widest uppercase inline-block">Premium 🔥</span>}
                                                </h4>
                                                {viewMode !== 'compact' && (
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed font-medium">{highlightMatch(product.description || 'Delicioso producto elaborado de forma puramente artesanal con ingredientes frescos locales.', searchQuery)}</p>
                                                )}
                                                {viewMode === 'compact' && product.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{highlightMatch(product.description, searchQuery)}</p>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-3 ${viewMode === 'compact' ? 'shrink-0' : 'justify-between mt-3'}`}>
                                                <span className="font-black text-brand-primary font-mono text-sm shrink-0">€{Number(product.price).toFixed(2)}</span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (product.id === 'box1' || product.name.toLowerCase().includes('box')) {
                                                            setBoxCustomizing(product);
                                                        } else {
                                                            addToCart(product);
                                                        }
                                                    }}
                                                    className="bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-black w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-90 border border-brand-primary/25 cursor-pointer z-10 shrink-0"
                                                    title="Añadir al Carrito"
                                                >
                                                    <Plus size={16} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                    );
                })}
            </div>
            </div>

            {/* Floating Cart Modal / Bottom Sheet */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        className="bg-surface-container border-t border-white/10 rounded-t-[40px] p-6 relative z-10 max-h-[80vh] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
                        <h2 className="text-2xl font-black mb-6">Tu Pedido</h2>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Tu carrito está vacío.</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product.id} className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{item.product.name}</h4>
                                            <span className="text-brand-primary font-bold text-sm">€{Number(item.product.price).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-surface-bright rounded-full px-2 py-1 border border-white/5">
                                            <button onClick={() => removeFromCart(item.product.id, item.notes)} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 text-gray-400 hover:text-white">
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold w-4 text-center">{item.qty}</span>
                                            <button onClick={() => addToCart(item.product, item.notes)} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 text-gray-400 hover:text-white">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-sm">Total a Pagar</span>
                                <span className="text-3xl font-black">€{cartTotal.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full bg-brand-primary text-black font-black text-lg py-5 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl shadow-brand-primary/20"
                            >
                                Confirmar Pedido <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* In-app custom success modal */}
            <AnimatePresence>
                {isSuccessModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-surface-container border border-white/10 p-6 rounded-[2rem] max-w-xs w-full shadow-2xl relative text-center flex flex-col items-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 border border-green-500/20">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black mb-2 text-white tracking-tight">¡Hecho!</h3>
                            <p className="text-gray-400 text-xs mb-6 leading-relaxed">{successMessage}</p>
                            <button 
                                onClick={() => setIsSuccessModalOpen(false)} 
                                className="w-full py-3 rounded-xl font-black text-sm bg-brand-primary text-black hover:bg-brand-yellow transition-colors active:scale-95"
                            >
                                Entendido
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Box Customization Modal */}
            <AnimatePresence>
                {boxCustomizing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-surface-container border border-white/10 p-6 rounded-[2rem] max-w-sm w-full shadow-2xl relative flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black text-white">Configura tu Box</h3>
                                <button onClick={() => setBoxCustomizing(null)} className="text-gray-400 hover:text-white"><CheckCircle className="rotate-45" /></button>
                            </div>
                            
                            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Elige tu Pizza</label>
                                    <select value={boxPizza} onChange={e => setBoxPizza(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-primary">
                                        <option value="">Selecciona Pizza...</option>
                                        {products.filter(p => p.category === 'Pizzas').map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Acompañamiento</label>
                                    <select value={boxSide} onChange={e => setBoxSide(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-primary">
                                        <option value="Patatas">Patatas</option>
                                        <option value="Ensalada">Ensalada (+€2.00)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Bebida</label>
                                    <select value={boxDrink} onChange={e => setBoxDrink(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-primary">
                                        <option value="">Selecciona Bebida...</option>
                                        {products.filter(p => p.category === 'Bebidas').map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Media Ración de Aperitivo</label>
                                    <select value={boxSnack} onChange={e => setBoxSnack(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-primary">
                                        <option value="">Selecciona Aperitivo...</option>
                                        {products.filter(p => p.category === 'Aperitivos').map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleAddBox} 
                                disabled={!boxPizza || !boxDrink || !boxSnack}
                                className="w-full py-4 rounded-xl font-black text-sm bg-brand-primary text-black disabled:opacity-50 transition-colors hover:bg-brand-yellow active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Añadir al Carrito
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <NotificationManager />
        </div>
    </div>
    );
};
