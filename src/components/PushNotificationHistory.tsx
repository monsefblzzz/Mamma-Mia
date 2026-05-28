import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, XCircle, RefreshCw, Search, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';

interface PushLog {
    id: string;
    title: string;
    body: string;
    sentAt: number;
    successCount: number;
    failureCount: number;
    details: Array<{ phone: string, status: string, error?: string }>;
}

export const PushNotificationHistory = () => {
    const [logs, setLogs] = useState<PushLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { storeSettings } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/push/logs');
            const data = await res.json();
            setLogs(data);
        } catch (e) {
            console.error('Error fetching push logs', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            let matchPhone = true;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                matchPhone = log.details.some(d => d.phone.toLowerCase().includes(term));
            }
            
            let matchDate = true;
            const logDate = new Date(log.sentAt).toISOString().split('T')[0];
            if (startDate && logDate < startDate) matchDate = false;
            if (endDate && logDate > endDate) matchDate = false;

            return matchPhone && matchDate;
        });
    }, [logs, searchTerm, startDate, endDate]);

    const handleSendTest = async () => {
        if (!storeSettings.vapidKey || !storeSettings.vapidPrivateKey) {
            alert('Debe guardar primero la clave VAPID pública y privada en los ajustes de la tienda.');
            return;
        }
        try {
            await fetch('/api/push/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    vapidKey: storeSettings.vapidKey,
                    vapidPrivateKey: storeSettings.vapidPrivateKey
                })
            });
            const indicator = document.querySelector('.notification-status-indicator');
            if (indicator) {
                indicator.classList.add('data-pulsing');
                setTimeout(() => indicator.classList.remove('data-pulsing'), 2000);
            }
            fetchLogs();
            alert('Enviando notificación...');
        } catch (e) {
            alert('Error enviando prueba');
        }
    };

    return (
        <div className="bg-surface-container rounded-3xl p-6 border border-white/5 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white tracking-widest uppercase text-sm mb-1 flex items-center gap-2">
                        <div className="relative">
                            <Bell size={16} className="text-brand-primary" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 notification-status-indicator" />
                        </div>
                        Historial Notificaciones Push
                    </h3>
                    <p className="text-xs text-gray-500">Registro de los avisos enviados a los clientes</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchLogs} 
                        className="bg-surface-base p-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
                        title="Actualizar"
                    >
                        <RefreshCw size={16} className={cn("text-gray-400", loading && "animate-spin")} />
                    </button>
                    <button 
                        onClick={handleSendTest} 
                        className="bg-brand-primary/20 border border-brand-primary/50 text-brand-primary font-bold uppercase tracking-widest text-[10px] px-4 py-3 rounded-xl hover:bg-brand-primary/30 transition shadow-inner flex items-center gap-2"
                    >
                        <Bell size={14} />
                        Prueba Push
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar por teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-brand-primary outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <Calendar className="text-gray-400 shrink-0" size={16} />
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-primary outline-none transition-colors"
                    />
                    <span className="text-gray-500">-</span>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-primary outline-none transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-32 flex items-center justify-center text-gray-500 text-xs tracking-widest uppercase">
                    Cargando historial...
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-gray-500 text-xs tracking-widest uppercase border-2 border-dashed border-white/5 rounded-2xl">
                    No hay notificaciones encontradas
                </div>
            ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredLogs.map(log => (
                        <div key={log.id} className="bg-surface-base rounded-2xl p-4 border border-white/5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="text-white font-bold text-sm tracking-wide">{log.title}</h4>
                                    <p className="text-gray-400 text-xs mb-1">{log.body}</p>
                                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">{new Date(log.sentAt).toLocaleString('es-ES')}</p>
                                </div>
                                <div className="flex gap-3 text-xs font-bold uppercase tracking-widest text-right">
                                    <div className="flex items-center gap-1 text-green-400">
                                        <span>{log.successCount}</span>
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <div className="flex items-center gap-1 text-red-400">
                                        <span>{log.failureCount}</span>
                                        <XCircle size={12} />
                                    </div>
                                </div>
                            </div>
                            
                            {log.details && log.details.length > 0 && (
                                <div className="mt-3 bg-black/30 rounded-xl p-3 border border-white/5 space-y-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Detalle de Resumen</p>
                                    {log.details.map((detail, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                                            <span className="text-gray-300">{detail.phone}</span>
                                            {detail.status === 'success' ? (
                                                <span className="text-green-400 font-bold">RECIBIDO</span>
                                            ) : (
                                                <span className="text-red-400" title={detail.error}>FALLO</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
