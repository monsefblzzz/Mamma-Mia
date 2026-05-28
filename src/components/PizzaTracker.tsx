import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ChefHat, Bike, MapPin, Receipt, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

interface TrackerProps {
    orderId: string;
}

export function PizzaTracker({ orderId }: TrackerProps) {
    const { orders } = useStore();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const found = orders.find(o => o.id === orderId);
        if (found) {
            setOrder(found);
        }
    }, [orders, orderId]);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-white h-full min-h-[300px]">
                <PackageSearch className="w-12 h-12 mb-4 text-gray-500 animate-pulse" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Buscando tu pedido...</p>
            </div>
        );
    }

    const steps = [
        { status: 'PENDIENTE', label: 'Recibido', icon: Receipt },
        { status: 'PREPARANDO', label: 'En Horno', icon: ChefHat },
        { status: 'LISTO', label: 'Listo', icon: CheckCircle }, // Used mostly for RECOGIDA
        { status: 'EN_REPARTO', label: 'En Camino', icon: Bike }, // Used mostly for DOMICILIO
        { status: 'COMPLETADO', label: 'Entregado', icon: MapPin },
    ];

    let activeSteps = steps;
    if (order.type === 'MESA') {
        activeSteps = [
            { status: 'PENDIENTE', label: 'Recibido', icon: Receipt },
            { status: 'PREPARANDO', label: 'Preparando', icon: ChefHat },
            { status: 'COMPLETADO', label: 'Entregado', icon: CheckCircle },
        ];
    } else if (order.type === 'RECOGIDA') {
            activeSteps = [
            { status: 'PENDIENTE', label: 'Recibido', icon: Receipt },
            { status: 'PREPARANDO', label: 'En Horno', icon: ChefHat },
            { status: 'LISTO', label: 'Listo para Recoger', icon: CheckCircle },
            { status: 'COMPLETADO', label: 'Entregado', icon: MapPin },
        ];
    }

    let currentIndex = activeSteps.findIndex(s => s.status === order.status);
    if (currentIndex === -1) {
        // Fallback for completion
        if (order.status === 'COMPLETADO') currentIndex = activeSteps.length - 1;
        // Map EN_REPARTO to fallback if somehow in MESA
        else if (order.status === 'EN_REPARTO' && order.type !== 'DOMICILIO') currentIndex = activeSteps.length - 1;
        else currentIndex = 0;
    }

    return (
        <div className="bg-surface-container rounded-[2rem] p-6 shadow-2xl border border-white/5 mx-auto max-w-sm w-full">
            <div className="text-center mb-8">
                <h3 className="text-brand-primary font-black uppercase text-xs tracking-widest mb-2">Pedido #{order.id.slice(-4)}</h3>
                <h2 className="text-2xl font-black text-white">Sigue tu Mamma Mia!</h2>
                {order.type === 'DOMICILIO' && order.address && (
                    <p className="text-xs font-semibold text-gray-400 mt-2 flex justify-center items-center gap-1">
                        <MapPin size={12} className="text-brand-yellow" />
                        {order.address.split(',')[0]}
                    </p>
                )}
            </div>

            <div className="relative">
                {/* Progress bar background */}
                <div className="absolute left-[24px] top-4 bottom-4 w-1 bg-white/10 rounded-full" />
                
                {/* Active progress bar */}
                <motion.div 
                    className="absolute left-[24px] top-4 w-1 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(255,214,0,0.5)]"
                    initial={{ height: 0 }}
                    animate={{ height: `${(currentIndex / (activeSteps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />

                <div className="space-y-6 relative z-10">
                    {activeSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= currentIndex;
                        const isActive = index === currentIndex;

                        return (
                            <div key={step.status} className="flex items-center gap-6">
                                <motion.div 
                                    className={`w-12 h-12 rounded-full flex justify-center items-center border-[3px] transition-colors ${isCompleted ? 'bg-brand-primary text-black border-brand-primary shadow-[0_0_15px_rgba(255,214,0,0.3)]' : 'bg-surface-base text-gray-500 border-white/10'}`}
                                    animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                                    transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                                >
                                    <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                                </motion.div>
                                <div className="flex-1">
                                    <h4 className={`text-lg font-black transition-colors ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</h4>
                                    {isActive && (
                                        <motion.p 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-xs text-brand-yellow mt-1 font-bold tracking-wide"
                                        >
                                            {step.status === 'PREPARANDO' && 'Nuestros chefs están en ello...'}
                                            {step.status === 'EN_REPARTO' && 'El repartidor ya ha salido.'}
                                            {step.status === 'LISTO' && 'Puedes pasar a recogerlo.'}
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
