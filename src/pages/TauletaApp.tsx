import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../db/DatabaseService';
import { ChefHat, Check, Clock, AlertCircle } from 'lucide-react';

export const TauletaApp = () => {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const ords = await dbService.getOrders();
            setOrders(ords);
        };
        fetchOrders();
        
        const unsubscribe = dbService.subscribe(fetchOrders);
        return () => unsubscribe();
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
            <div className={`flex-1 bg-surface-container rounded-3xl border border-white/5 flex flex-col overflow-hidden relative shadow-2xl`}>
                <div className={`p-6 border-b ${borderClass} bg-surface-bright flex items-center justify-between`}>
                    <h2 className="text-xl font-display font-black tracking-tight flex items-center gap-2">
                        <Icon size={24} className={colorClass} /> {title}
                    </h2>
                    <span className="bg-black/50 text-white px-3 py-1 rounded-full font-bold text-sm">
                        {columnOrders.length}
                    </span>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                    <AnimatePresence>
                        {columnOrders.map(order => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={order.id}
                                className="bg-surface-base p-5 rounded-2xl border border-white/5 shadow-lg group relative"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold uppercase px-2 py-1 rounded bg-surface-bright ${colorClass} bg-opacity-20`}>
                                            #{order.id}
                                        </span>
                                        <span className="font-bold text-gray-300">{order.customer_name}</span>
                                    </div>
                                    <span className="text-xs text-brand-primary/50 font-mono">
                                        {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-400 mb-4 bg-black/40 p-3 rounded-xl border border-white/5">
                                    <p className="font-medium text-white mb-2">Comanda:</p>
                                    <ul className="space-y-1">
                                    {order.items?.map((item: any, idx: number) => (
                                        <li key={idx} className="flex justify-between">
                                            <span>{item.quantity}x {item.name || 'Producto Desconocido'}</span>
                                            {item.notes && <span className="text-brand-yellow text-xs italic ml-2">-- {item.notes}</span>}
                                        </li>
                                    ))}
                                    {(!order.items || order.items.length === 0) && <li>Ver detalles compl. en PGLite</li>}
                                    </ul>
                                </div>
                                
                                {statusId !== 'delivered' && (
                                    <button 
                                        onClick={() => updateStatus(order.id, order.status)}
                                        className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2
                                            ${statusId === 'pending' ? 'bg-brand-primary text-black hover:bg-brand-yellow' : 
                                              statusId === 'preparing' ? 'bg-brand-blue text-white hover:bg-brand-light-blue' :
                                              'bg-brand-red text-white hover:bg-red-500'}`}
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
        <div className="min-h-screen bg-surface-base text-white font-sans p-6 overflow-hidden flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-brand-primary tracking-tight">Tauleta | Sala y Cuina</h1>
                    <p className="text-gray-400 font-medium">Gestión Kanban en Tiempo Real (PGLite)</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-surface-container px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-sm text-gray-300">Sincronizado OPFS/IDB</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden">
                <StatusColumn 
                    title="Pendiente" 
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
                    colorClass="text-green-500" 
                    borderClass="border-green-500/20" 
                />
            </div>
        </div>
    );
};
