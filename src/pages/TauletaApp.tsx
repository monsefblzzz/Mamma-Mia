import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../db/DatabaseService';
import { ChefHat, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TauletaApp = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const ords = await dbService.getOrders();
            setOrders(ords);
        };
        fetchOrders();
        
        const unsubscribe = dbService.subscribe(fetchOrders);
        return () => { unsubscribe(); };
    }, []);

    const updateStatus = async (orderId: number, currentStatus: string) => {
        const flow = {
            'pending': 'preparing',
            'preparing': 'ready',
            'ready': 'delivered'
        };
        const next = (flow as any)[currentStatus];
        if (next) {
            await dbService.updateOrderStatus(orderId, next);
            // This will trigger 'notify' which triggers fetchOrders
        }
    };

    const StatusColumn = ({ title, statusId, icon: Icon, colorClass, borderClass }: any) => {
        const columnOrders = orders.filter(o => o.status === statusId);

        return (
            <div className="flex-1 bg-surface-container/25 backdrop-blur-xl rounded-[2rem] border border-white/5 flex flex-col overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-white/10 transition-colors">
                <div className={`p-6 border-b ${borderClass} bg-white/[0.01] flex items-center justify-between`}>
                    <h2 className="text-xl font-display font-black tracking-tight flex items-center gap-2">
                        <Icon size={20} className={colorClass} /> {title}
                    </h2>
                    <span className="bg-black/60 border border-white/5 text-white px-3.5 py-1 rounded-full font-black text-xs">
                        {columnOrders.length}
                    </span>
                </div>
                
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-5">
                    <AnimatePresence>
                        {columnOrders.map(order => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                key={order.id}
                                className="bg-black/55 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl group relative hover:border-white/10 hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 ${colorClass}`}>
                                            #{order.id}
                                        </span>
                                        <span className="font-black text-sm text-white">{order.customer_name}</span>
                                    </div>
                                    <span className="text-xs text-brand-primary/60 font-mono font-bold">
                                        {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-300 mb-5 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <p className="font-bold text-gray-400 mb-2 uppercase tracking-wider text-[10px]">Comanda:</p>
                                    <ul className="space-y-2">
                                    {order.items?.map((item: any, idx: number) => (
                                        <li key={idx} className="flex justify-between leading-tight font-bold">
                                            <span className="text-white"><strong className="text-brand-primary mr-1">{item.quantity}x</strong> {item.name || 'Producto Desconocido'}</span>
                                            {item.notes && <span className="text-brand-yellow text-xs italic ml-2">({item.notes})</span>}
                                        </li>
                                    ))}
                                    {(!order.items || order.items.length === 0) && <li className="text-gray-500 italic">Ver detalles compl. en PGLite</li>}
                                    </ul>
                                </div>
                                
                                {statusId !== 'delivered' && (
                                    <button 
                                        onClick={() => updateStatus(order.id, order.status)}
                                        className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer
                                            ${statusId === 'pending' ? 'bg-brand-primary text-black hover:bg-brand-yellow shadow-[0_5px_15px_rgba(225,184,70,0.2)]' : 
                                              statusId === 'preparing' ? 'bg-brand-blue text-white hover:bg-brand-light-blue shadow-[0_5px_15px_rgba(34,107,172,0.2)]' :
                                              'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_5px_15px_rgba(16,185,129,0.2)]'}`}
                                    >
                                        {statusId === 'pending' ? 'Empezar a Preparar' : 
                                         statusId === 'preparing' ? 'Marcar como Listo' : 
                                         'Entregar'}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#020101] via-surface-base to-[#0f0b08] text-white font-sans p-6 md:p-8 overflow-hidden flex flex-col relative">
            {/* Background glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[50rem] h-[50rem] rounded-full bg-brand-primary/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[0] right-[-20%] w-[40rem] h-[40rem] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10 border-b border-white/5 pb-6">
                <div>
                    <span className="text-brand-primary font-black uppercase tracking-[0.25em] text-xs">Pérfecctamente Sincronizado</span>
                    <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight mt-1">Sala &amp; Cuina</h1>
                    <p className="text-gray-400 font-bold text-sm mt-1">Control de comensales y estados de preparación en cocina en tiempo real.</p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-surface-container border border-white/10 hover:bg-white/5 active:bg-white/10 hover:text-white text-gray-400 font-bold px-4 py-2.5 rounded-2xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="Volver al Inicio"
                    >
                        Salir
                    </button>
                    <div className="bg-surface-container/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex items-center gap-2.5 border border-white/10 shadow-lg">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="font-bold text-xs text-gray-300 uppercase tracking-wider">PGLite Activo &amp; OPFS</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden relative z-10">
                <StatusColumn 
                    title="Pediente" 
                    statusId="pending" 
                    icon={Clock} 
                    colorClass="text-brand-primary" 
                    borderClass="border-brand-primary/20" 
                />
                <StatusColumn 
                    title="En Preparación" 
                    statusId="preparing" 
                    icon={ChefHat} 
                    colorClass="text-brand-blue" 
                    borderClass="border-brand-blue/20" 
                />
                <StatusColumn 
                    title="Listo" 
                    statusId="ready" 
                    icon={Check} 
                    colorClass="text-emerald-400" 
                    borderClass="border-emerald-500/20" 
                />
            </div>
        </div>
    );
};
