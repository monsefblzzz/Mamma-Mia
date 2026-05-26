import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Mic, Send, ChefHat, MapPin, ChevronRight, Plus, Minus } from 'lucide-react';
import { dbService } from '../db/DatabaseService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AppCliente = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
    const [orderText, setOrderText] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            const categories = await dbService.getCategories();
            const prods = await dbService.getProducts();
            // simple merge for now
            setProducts(prods);
        };
        fetchProducts();
        
        const unsubscribe = dbService.subscribe(fetchProducts);
        return () => unsubscribe();
    }, []);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.product.id === product.id);
            if (existing) {
                return prev.map(p => p.product.id === product.id ? {...p, qty: p.qty + 1} : p);
            }
            return [...prev, {product, qty: 1}];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(p => p.product.id === productId);
            if (existing && existing.qty > 1) {
                return prev.map(p => p.product.id === productId ? {...p, qty: p.qty - 1} : p);
            }
            return prev.filter(p => p.product.id !== productId);
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

        const items = cart.map(item => ({
            productId: item.product.id,
            qty: item.qty
        }));
        
        await dbService.createComplexOrder(user.name || 'Cliente Online', user.phone, items);
        setCart([]);
        setIsCartOpen(false);
        alert('¡Pedido realizado con éxito!');
    };

    const handleAIAssist = () => {
        if (!orderText.trim()) return;
        alert(`Simulación AI: Procesando tu pedido dictado -> "${orderText}"`);
        setOrderText('');
    }

    return (
        <div className="min-h-screen bg-surface-base text-white font-sans max-w-md mx-auto relative overflow-hidden pb-24 shadow-2xl safe-area-pt">
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
            </header>

            {/* AI Ordering Area */}
            <div className="px-6 mt-6 mb-8">
                <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-3xl p-5 shadow-[0_0_30px_rgba(34,107,172,0.1)]">
                    <h2 className="text-sm font-bold text-brand-light-blue mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Mic size={16} /> Pedido por Voz / Texto
                    </h2>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors"
                            placeholder="Ej: Quiero una margarita y dos colas..."
                            value={orderText}
                            onChange={(e) => setOrderText(e.target.value)}
                        />
                        <button 
                            onClick={handleAIAssist}
                            className="bg-brand-blue text-white p-3 rounded-2xl hover:bg-brand-light-blue transition-colors active:scale-95 flex items-center justify-center"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Layout */}
            <div className="px-6 space-y-8">
                <div>
                    <h3 className="text-2xl font-black mb-4">Nuestra Carta</h3>
                    <div className="space-y-4">
                        {products.map(product => (
                            <motion.div 
                                key={product.id}
                                className="bg-surface-container rounded-3xl p-4 flex gap-4 border border-white/5 shadow-lg relative overflow-hidden"
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="w-24 h-24 bg-surface-bright rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/5 overflow-hidden">
                                     {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                     ) : (
                                        <ChefHat size={32} className="text-gray-600 opacity-50"/>
                                     )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h4 className="font-bold text-white leading-tight">{product.name}</h4>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description || 'Delicioso producto artesanal'}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-black text-brand-primary">€{Number(product.price).toFixed(2)}</span>
                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="bg-white/10 hover:bg-brand-primary text-white hover:text-black w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
                                            <button onClick={() => removeFromCart(item.product.id)} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 text-gray-400 hover:text-white">
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold w-4 text-center">{item.qty}</span>
                                            <button onClick={() => addToCart(item.product)} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 text-gray-400 hover:text-white">
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
        </div>
    );
};
