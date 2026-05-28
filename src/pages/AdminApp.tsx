import React, { useState, useEffect } from 'react';
import { dbService } from '../db/DatabaseService';
import { AlertTriangle, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const AdminApp = () => {
    const navigate = useNavigate();
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchIngs = async () => {
            const ings = await dbService.getIngredients();
            setIngredients(ings);
        };
        fetchIngs();
        
        const unsubscribe = dbService.subscribe(fetchIngs);
        return () => { unsubscribe(); };
    }, []);

    const handleEditStart = (ing: any) => {
        setEditingId(ing.id);
        setEditForm({...ing});
    };

    const handleEditSave = async () => {
        if (!editingId) return;
        await dbService.updateIngredient(editingId, {
            name: editForm.name,
            stock_quantity: parseFloat(editForm.stock_quantity),
            unit: editForm.unit,
            min_stock_alert: parseFloat(editForm.min_stock_alert)
        });
        setEditingId(null);
    };

    const handleAddSave = async () => {
        await dbService.addIngredient({
            name: editForm.name,
            stock_quantity: parseFloat(editForm.stock_quantity || '0'),
            unit: editForm.unit || 'kg',
            min_stock_alert: parseFloat(editForm.min_stock_alert || '0')
        });
        setIsAdding(false);
        setEditForm({});
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Estás seguro de que quieres eliminar este ingrediente?")) {
            await dbService.deleteIngredient(id);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#020101] via-surface-base to-[#0f0b08] text-white p-6 md:p-10 font-sans relative overflow-hidden selection:bg-brand-primary selection:text-black">
            {/* Background glowing ornaments */}
            <div className="absolute top-[-20%] right-[-20%] w-[50rem] h-[50rem] rounded-full bg-brand-primary/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand-red/5 blur-[120px] pointer-events-none" />

            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                <div>
                     <span className="text-brand-primary font-black uppercase tracking-[0.25em] text-xs">Administración Central</span>
                     <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight mt-1">Inventario PGLite</h1>
                     <p className="text-gray-400 font-bold text-sm mt-1">Supervisión y abastecimiento de materias primas en tiempo real.</p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-surface-container border border-white/10 hover:bg-white/5 active:bg-white/10 hover:text-white text-gray-400 font-bold py-4 px-4 rounded-2xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="Volver al Inicio"
                    >
                        Salir
                    </button>
                    <button 
                        onClick={() => { setIsAdding(true); setEditForm({}); setEditingId(null); }}
                        className="bg-brand-primary text-black hover:bg-brand-yellow font-black py-4 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.2)] border border-brand-primary/20 shrink-0 cursor-pointer"
                    >
                        <Plus size={18} strokeWidth={3} /> Añadir Ingrediente
                    </button>
                </div>
            </header>

            <div className="bg-surface-container/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden relative z-10">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/10">
                                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em]">Ingrediente</th>
                                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em]">Stock Actual</th>
                                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em] text-center">Unidad</th>
                                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em]">Alerta Crítica</th>
                                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-[0.2em] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {isAdding && (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-brand-primary/[0.02] border-b border-white/5"
                                    >
                                        <td className="p-6">
                                            <input type="text" placeholder="Ej: Tomate Marzano" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors font-bold text-white placeholder-gray-600" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                        </td>
                                        <td className="p-6">
                                            <input type="number" step="0.1" placeholder="0.00" className="w-28 bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors font-bold text-white" value={editForm.stock_quantity || ''} onChange={e => setEditForm({...editForm, stock_quantity: e.target.value})} />
                                        </td>
                                        <td className="p-6 text-center">
                                            <input type="text" placeholder="u" className="w-16 text-center bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors font-bold text-white uppercase placeholder-gray-650" value={editForm.unit || ''} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                                        </td>
                                        <td className="p-6">
                                            <input type="number" step="0.1" placeholder="Ej: 5.0" className="w-28 bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors font-bold text-white" value={editForm.min_stock_alert || ''} onChange={e => setEditForm({...editForm, min_stock_alert: e.target.value})} />
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={handleAddSave} className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-black transition-all cursor-pointer border border-green-500/20 shadow-md flex items-center justify-center" title="Guardar"><Save size={16} /></button>
                                                <button onClick={() => setIsAdding(false)} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all cursor-pointer border border-white/10 flex items-center justify-center" title="Cancelar"><X size={16} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )}
                                
                                {ingredients.map(ing => {
                                    const isEditing = editingId === ing.id;
                                    const isLowStock = parseFloat(ing.stock_quantity) <= parseFloat(ing.min_stock_alert);
                                    
                                    return (
                                        <motion.tr 
                                            key={ing.id}
                                            layout
                                            className={`transition-colors ${isLowStock ? 'bg-brand-red/[0.03] hover:bg-brand-red/[0.06]' : 'hover:bg-white/[0.02]'}`}
                                        >
                                            <td className="p-6 font-bold text-white">
                                                <div className="flex items-center gap-3">
                                                    {isLowStock && (
                                                        <span className="flex h-2 w-2 relative shrink-0">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red shadow-lg"></span>
                                                        </span>
                                                    )}
                                                    {isEditing ? (
                                                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-bold max-w-xs focus:border-brand-primary outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            {ing.name}
                                                            {isLowStock && <span className="text-[9px] bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-md font-black uppercase tracking-wider border border-brand-red/20 shadow-sm">Bajo Stock</span>}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {isEditing ? (
                                                    <input type="number" step="0.1" className="w-28 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-brand-primary outline-none" value={editForm.stock_quantity} onChange={e => setEditForm({...editForm, stock_quantity: e.target.value})} />
                                                ) : (
                                                    <span className={`font-mono font-black text-base ${isLowStock ? 'text-brand-red drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'text-emerald-400'}`}>
                                                        {parseFloat(ing.stock_quantity).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-center text-gray-400 font-black tracking-wider uppercase text-xs">
                                                {isEditing ? (
                                                    <input type="text" className="w-16 text-center bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-brand-primary outline-none" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                                                ) : ing.unit}
                                            </td>
                                            <td className="p-6 text-gray-400 font-mono font-semibold">
                                                {isEditing ? (
                                                    <input type="number" step="0.1" className="w-28 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-brand-primary outline-none" value={editForm.min_stock_alert} onChange={e => setEditForm({...editForm, min_stock_alert: e.target.value})} />
                                                ) : parseFloat(ing.min_stock_alert).toFixed(2)}
                                            </td>
                                            <td className="p-6 text-right">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleEditSave} className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-black transition-all cursor-pointer border border-green-500/20 shadow-md flex items-center justify-center"><Save size={16} /></button>
                                                        <button onClick={() => setEditingId(null)} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all cursor-pointer border border-white/10 flex items-center justify-center"><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEditStart(ing)} className="p-3 bg-white/5 text-brand-primary hover:text-black hover:bg-brand-primary rounded-xl transition-all cursor-pointer border border-white/5 hover:border-brand-primary flex items-center justify-center"><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete(ing.id)} className="p-3 bg-white/5 text-brand-red hover:text-white hover:bg-brand-red rounded-xl transition-all cursor-pointer border border-white/5 hover:border-brand-red flex items-center justify-center"><Trash2 size={16} /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {ingredients.length === 0 && !isAdding && (
                        <div className="text-center py-16 text-gray-500 font-bold flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">📦</span>
                            <span>No hay ingredientes registrados en PGLite. Agrega uno nuevo para iniciar.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
