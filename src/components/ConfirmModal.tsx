import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Drawer } from 'vaul';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'success' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning'
}) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    let accentColor = 'bg-brand-primary text-black hover:bg-brand-primary/90';
    let iconColor = 'text-brand-primary';
    let Icon = AlertTriangle;

    if (type === 'danger') {
        accentColor = 'bg-brand-red text-white hover:bg-brand-red/90';
        iconColor = 'text-brand-red';
    } else if (type === 'success') {
        accentColor = 'bg-green-500 text-black hover:bg-green-500/90';
        iconColor = 'text-green-500';
        Icon = CheckCircle;
    }

    if (isDesktop) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-surface-container border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconColor.replace('text-', 'bg-').replace('-500', '-500/10').replace('-primary', '-primary/10').replace('-red', '-red/10')} mb-6`}>
                                <Icon size={32} className={iconColor} />
                            </div>
                            <h3 className="text-xl font-black mb-3 text-white tracking-tight">{title}</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">{description}</p>
                            <div className="flex gap-4">
                                <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
                                    {cancelText}
                                </button>
                                <button 
                                    onClick={() => { onConfirm(); onClose(); }} 
                                    className={`flex-1 py-3 px-4 rounded-xl font-black transition-colors shadow-lg ${accentColor}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/80 z-[200] backdrop-blur-sm" />
                <Drawer.Content className="bg-surface-container flex flex-col rounded-t-[2rem] border-t border-white/10 mt-24 fixed bottom-0 left-0 right-0 z-[200]">
                    <div className="p-4 bg-surface-container rounded-t-[2rem] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />
                        <div className="px-4 pb-8 text-center max-w-md mx-auto">
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${iconColor.replace('text-', 'bg-').replace('-500', '-500/10').replace('-primary', '-primary/10').replace('-red', '-red/10')} mb-6`}>
                                <Icon size={32} className={iconColor} />
                            </div>
                            <Drawer.Title className="text-2xl font-black mb-3 text-white tracking-tight">{title}</Drawer.Title>
                            <Drawer.Description className="text-gray-400 text-sm mb-8 leading-relaxed">
                                {description}
                            </Drawer.Description>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => { onConfirm(); onClose(); }} 
                                    className={`w-full py-4 px-4 rounded-2xl font-black transition-colors shadow-lg ${accentColor}`}
                                >
                                    {confirmText}
                                </button>
                                <button onClick={onClose} className="w-full py-4 px-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
                                    {cancelText}
                                </button>
                            </div>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
