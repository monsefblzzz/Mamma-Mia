import React, { useState, useEffect } from 'react';
import { dbService } from '../db/DatabaseService';
import { AlertTriangle, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminApp = () => {
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
        return () => unsubscribe();
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
        <div className="min-h-screen bg-surface-base text-white p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-black text-brand-primary tracking-tight">Panel de Administración</h1>
                    <p className="text-gray-400 font-medium mt-1">Gestión de Inventario PGLite</p>
                </div>
                <button 
                    onClick={() => { setIsAdding(true); setEditForm({}); setEditingId(null); }}
                    className="bg-brand-blue hover:bg-brand-light-blue text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                >
                    <Plus size={20} /> Añadir Ingrediente
                </button>
            </header>

            <div className="bg-surface-container rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-white/5">
                                <th className="p-4 font-bold text-gray-400 uppercase text-sm tracking-wider">Nombre</th>
                                <th className="p-4 font-bold text-gray-400 uppercase text-sm tracking-wider">Stock Actual</th>
                                <th className="p-4 font-bold text-gray-400 uppercase text-sm tracking-wider text-center">Unidad</th>
                                <th className="p-4 font-bold text-gray-400 uppercase text-sm tracking-wider">Alerta Mínima</th>
                                <th className="p-4 font-bold text-gray-400 uppercase text-sm tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {isAdding && (
                                    <motion.tr 
                                        initial={{ opacity: 0, backgroundColor: 'rgba(255, 204, 0, 0.1)' }}
                                        animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-white/5"
                                    >
                                        <td className="p-4">
                                            <input type="text" placeholder="Nombre" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 focus:border-brand-primary focus:outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                        </td>
                                        <td className="p-4">
                                            <input type="number" step="0.1" className="w-24 bg-black/50 border border-white/10 rounded-lg p-2 focus:border-brand-primary focus:outline-none" value={editForm.stock_quantity || ''} onChange={e => setEditForm({...editForm, stock_quantity: e.target.value})} />
                                        </td>
                                        <td className="p-4 text-center">
                                            <input type="text" className="w-16 text-center bg-black/50 border border-white/10 rounded-lg p-2 focus:border-brand-primary focus:outline-none" value={editForm.unit || ''} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                                        </td>
                                        <td className="p-4">
                                            <input type="number" step="0.1" className="w-24 bg-black/50 border border-white/10 rounded-lg p-2 focus:border-brand-primary focus:outline-none" value={editForm.min_stock_alert || ''} onChange={e => setEditForm({...editForm, min_stock_alert: e.target.value})} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={handleAddSave} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Save size={18} /></button>
                                                <button onClick={() => setIsAdding(false)} className="p-2 bg-brand-red/20 text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-colors"><X size={18} /></button>
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
                                            className={`border-b border-white/5 transition-colors ${isLowStock ? 'bg-brand-red/10 hover:bg-brand-red/20' : 'hover:bg-white/5'}`}
                                        >
                                            <td className="p-4 font-medium flex items-center gap-3">
                                                {isLowStock && <AlertTriangle size={18} className="text-brand-red animate-pulse" />}
                                                {isEditing ? (
                                                    <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-2" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                                ) : ing.name}
                                            </td>
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <input type="number" step="0.1" className="w-24 bg-black/50 border border-white/10 rounded-lg p-2" value={editForm.stock_quantity} onChange={e => setEditForm({...editForm, stock_quantity: e.target.value})} />
                                                ) : (
                                                    <span className={`font-mono font-bold ${isLowStock ? 'text-brand-red' : 'text-white'}`}>
                                                        {parseFloat(ing.stock_quantity).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-gray-400">
                                                {isEditing ? (
                                                    <input type="text" className="w-16 text-center bg-black/50 border border-white/10 rounded-lg p-2" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                                                ) : ing.unit}
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {isEditing ? (
                                                    <input type="number" step="0.1" className="w-24 bg-black/50 border border-white/10 rounded-lg p-2" value={editForm.min_stock_alert} onChange={e => setEditForm({...editForm, min_stock_alert: e.target.value})} />
                                                ) : parseFloat(ing.min_stock_alert).toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleEditSave} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Save size={18} /></button>
                                                        <button onClick={() => setEditingId(null)} className="p-2 bg-white/10 text-gray-400 rounded-lg hover:bg-white/20 hover:text-white transition-colors"><X size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEditStart(ing)} className="p-2 bg-brand-blue/20 text-brand-light-blue rounded-lg hover:bg-brand-blue hover:text-white transition-colors"><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete(ing.id)} className="p-2 bg-brand-red/20 text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-colors"><Trash2 size={18} /></button>
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
                        <div className="text-center py-12 text-gray-500">No hay ingredientes en la base de datos PGLite.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
