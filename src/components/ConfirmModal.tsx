import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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

    return (
        <AnimatePresence>
            {isOpen && (
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
};
