import React, { useRef, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertTriangle, Search, Trash2, Edit2, Save, X, Plus, ChevronLeft, ChevronRight, Users, ShoppingCart, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseTxtCustomers, parseCsvCustomers, parseJsonCustomers, detectZone } from '../data/customerParser';

export const CustomerImporter = () => {
    const { users, loadCustomers, createUser, updateUser, deleteUser, clearCustomers } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
    
    // Create new customer state
    const [isCreating, setIsCreating] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', address: '' });

    const [isIncrementalLoad, setIsIncrementalLoad] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const navigate = useNavigate();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('processing');
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                let newCustomers: any[] = [];
                
                if (file.name.endsWith('.csv')) {
                    newCustomers = parseCsvCustomers(text);
                } else if (file.name.endsWith('.json')) {
                    newCustomers = parseJsonCustomers(text);
                } else {
                    newCustomers = parseTxtCustomers(text);
                }

                if (newCustomers.length > 0) {
                    const existingPhones = new Set(users.map(u => u.phone));
                    const duplicates = newCustomers.filter(c => existingPhones.has(c.phone));
                    const uniqueNew = newCustomers.filter(c => !existingPhones.has(c.phone));
                    
                    let finalCustomers = [...uniqueNew];
                    let msj = '';

                    if (duplicates.length > 0) {
                        if (isIncrementalLoad) {
                            msj = `Se importaron ${uniqueNew.length} nuevos y se ignoraron ${duplicates.length} duplicados.`;
                        } else {
                            const overwrite = window.confirm(`Se han encontrado ${duplicates.length} clientes duplicados (mismo teléfono). ¿Deseas sobrescribir sus datos existentes con los del archivo?\n\nAceptar = Sobrescribir\nCancelar = Ignorar duplicados`);
                            if (overwrite) {
                                finalCustomers = [...newCustomers];
                                msj = `Se importaron ${uniqueNew.length} nuevos y se actualizaron ${duplicates.length} clientes.`;
                            } else {
                                msj = `Se importaron ${uniqueNew.length} nuevos y se ignoraron ${duplicates.length} duplicados.`;
                            }
                        }
                    } else {
                        msj = `Se han importado ${newCustomers.length} clientes nuevos con éxito.`;
                    }

                    if (finalCustomers.length > 0) {
                        // Pass strategy up or handle here. loadCustomers usually wraps setUsers.
                        // Assuming loadCustomers appends and deduplicates internally or we just pass it.
                        // For a real app, loadCustomers should accept a mode. We will pass finalCustomers.
                        if (loadCustomers) {
                             loadCustomers(finalCustomers);
                        }
                    }
                    
                    setStatus('success');
                    setMessage(msj);
                    setCurrentPage(1);
                } else {
                    setStatus('error');
                    setMessage('No se encontraron clientes con el formato correcto.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Error al procesar el archivo. Asegúrate de que el formato es válido.');
            }
        };

        reader.onerror = () => {
            setStatus('error');
            setMessage('Error al leer el archivo.');
        };

        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExportCSV = () => {
        const headers = ["Nombre", "Teléfono", "Dirección"];
        const rows = users.filter(u => u.role === 'CLIENTE').map(u => [
            `"${u.name}"`, 
            `"${u.phone}"`, 
            `"${u.address || ''}"`
        ]);
        
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "clientes_mammamia.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCreateCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomerForm.name || !newCustomerForm.phone) return;
        if (!/^\d{6,15}$/.test(newCustomerForm.phone)) {
            alert('El número de teléfono debe ser válido (al menos 6 dígitos).');
            return;
        }
        
        const zone = detectZone(newCustomerForm.address || '');
        
        createUser({ ...newCustomerForm, zone, role: 'CLIENTE' });
        setNewCustomerForm({ name: '', phone: '', address: '' });
        setIsCreating(false);
    };

    const handleEditClick = (user: any) => {
        setEditingUserId(user.id);
        setEditForm({ name: user.name, phone: user.phone, address: user.address || '' });
    };

    const handleSaveEdit = () => {
        if (!/^\d{6,15}$/.test(editForm.phone)) {
            alert('El número de teléfono no es válido.');
            return;
        }
        if (editingUserId && updateUser) {
            const updatedForm = { ...editForm, zone: detectZone(editForm.address || '') };
            updateUser(editingUserId, updatedForm);
            setEditingUserId(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?') && deleteUser) {
            deleteUser(id);
        }
    };

    const handleClearAll = () => {
         if (window.confirm('¿ELIMINAR TODOS LOS CLIENTES? Esta acción no se puede deshacer.') && clearCustomers) {
             clearCustomers();
         }
    };

    const customers = useMemo(() => {
        return users.filter(u => u.role === 'CLIENTE');
    }, [users]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers;
        const lowerSearch = searchTerm.toLowerCase();
        return customers.filter(c => 
            c.name.toLowerCase().includes(lowerSearch) || 
            c.phone.includes(lowerSearch) ||
            (c.address && c.address.toLowerCase().includes(lowerSearch)) ||
            (c.zone && c.zone.toLowerCase().includes(lowerSearch))
        );
    }, [customers, searchTerm]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface-container rounded-[2rem] p-8 md:p-10 border border-white/5 space-y-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-primary group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Upload size={100} />
                    </div>
                    <h3 className="text-2xl font-display font-black flex items-center gap-3 tracking-tight text-white relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-inner">
                            <FileText size={24} />
                        </div>
                        Importar Archivo
                    </h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest relative z-10 h-10 flex items-center">
                        Sube archivo (.txt, .csv, .json) para integrar clientes masivamente.
                    </p>
                    <input type="file" accept=".txt,.csv,.json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <label className="flex items-center gap-3 cursor-pointer mt-4 mb-6 text-sm font-bold text-gray-300 select-none hover:text-white transition-colors relative z-10">
                        <input
                            type="checkbox"
                            checked={isIncrementalLoad}
                            onChange={(e) => setIsIncrementalLoad(e.target.checked)}
                            className="rounded-lg border-gray-600 bg-black/50 w-5 h-5 text-brand-primary focus:ring-brand-primary accent-brand-primary cursor-pointer"
                        />
                        <span>Carga incremental (ignorar duplicados sin preguntar)</span>
                    </label>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={status === 'processing'}
                        className="w-full bg-brand-primary text-black font-black uppercase tracking-[0.2em] py-4 px-6 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(225,184,70,0.3)] relative z-10 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        <Upload size={20} />
                        {status === 'processing' ? 'Procesando...' : 'Seleccionar Archivo'}
                    </button>
                    {status === 'success' && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3 text-sm mt-4 font-bold relative z-10 shadow-inner hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-shadow">
                            <CheckCircle size={20} className="shrink-0" /> {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red p-4 rounded-xl flex items-center gap-3 text-sm mt-4 font-bold relative z-10 shadow-inner hover:shadow-[0_0_15px_rgba(255,107,107,0.1)] transition-shadow">
                            <AlertTriangle size={20} className="shrink-0" /> {message}
                        </div>
                    )}
                </div>

                <div className="bg-surface-container rounded-[2rem] p-8 md:p-10 border border-white/5 space-y-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-secondary group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Users size={100} />
                    </div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <h3 className="text-2xl font-display font-black flex items-center gap-3 tracking-tight text-white">
                            <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary border border-brand-secondary/20 shadow-inner">
                                <Users size={24} />
                            </div>
                            Crear Manualmente
                        </h3>
                    </div>
                    {isCreating ? (
                        <form onSubmit={handleCreateCustomer} className="space-y-4 animate-in fade-in zoom-in-95 duration-200 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Nombre" required value={newCustomerForm.name} onChange={e => setNewCustomerForm({...newCustomerForm, name: e.target.value})} className="bg-surface-base border border-white/10 rounded-2xl px-5 py-3 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none text-sm font-bold text-white shadow-inner transition-all w-full" />
                                <input type="tel" placeholder="Teléfono" required value={newCustomerForm.phone} onChange={e => setNewCustomerForm({...newCustomerForm, phone: e.target.value})} className="bg-surface-base border border-white/10 rounded-2xl px-5 py-3 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none text-sm font-mono font-bold text-white shadow-inner transition-all w-full" />
                            </div>
                            <input type="text" placeholder="Dirección (opcional)" value={newCustomerForm.address} onChange={e => setNewCustomerForm({...newCustomerForm, address: e.target.value})} className="w-full bg-surface-base border border-white/10 rounded-2xl px-5 py-3 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none text-sm font-bold text-white shadow-inner transition-all" />
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-brand-secondary text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,179,177,0.3)]">Guardar</button>
                                <button type="button" onClick={() => setIsCreating(false)} className="px-8 py-4 bg-white/10 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all">Cancelar</button>
                            </div>
                        </form>
                    ) : (
                        <>
                           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest relative z-10 h-10 flex items-center">
                               Añade un nuevo cliente de forma individual a la base de datos.
                           </p>
                           <button 
                               onClick={() => setIsCreating(true)}
                               className="w-full bg-brand-secondary text-black font-black uppercase tracking-[0.2em] py-4 px-6 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,179,177,0.3)] relative z-10"
                           >
                               <Plus size={20} />
                               Añadir Cliente
                           </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-surface-container rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="p-8 border-b border-white/5 space-y-6 relative z-10">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-display font-black text-white tracking-tighter">Directorio <span className="text-brand-primary">({customers.length})</span></h3>
                            {customers.length > 0 && (
                                <>
                                    <button onClick={handleExportCSV} className="text-xs font-bold text-green-400 hover:text-green-300 hover:bg-green-500/20 transition-all bg-green-500/10 px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-widest border border-green-500/20">
                                        <Download size={16} /> Exportar CSV
                                    </button>
                                    <button onClick={handleClearAll} className="text-xs font-bold text-brand-red hover:text-brand-red hover:bg-brand-red/20 transition-all bg-brand-red/10 px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-widest border border-brand-red/20">
                                        <Trash2 size={16} /> Borrar
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="relative w-full xl:w-96 flex-shrink-0">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-surface-base border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-brand-primary transition-all focus:ring-1 focus:ring-brand-primary shadow-inner placeholder:text-gray-600 tracking-wide"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10 custom-scrollbar">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-surface-base/80 border-b border-white/5 backdrop-blur-md">
                            <tr>
                                <th className="p-6 font-black text-xs uppercase tracking-[0.2em] text-brand-primary">Nombre</th>
                                <th className="p-6 font-black text-xs uppercase tracking-[0.2em] text-brand-primary">Teléfono</th>
                                <th className="p-6 font-black text-xs uppercase tracking-[0.2em] text-brand-primary">Zona</th>
                                <th className="p-6 font-black text-xs uppercase tracking-[0.2em] text-brand-primary">Dirección</th>
                                <th className="p-6 font-black text-xs uppercase tracking-[0.2em] text-brand-primary text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        {editingUserId === customer.id ? (
                                            <input 
                                                type="text" 
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                className="bg-surface-base border border-brand-primary/50 shadow-[0_0_15px_rgba(225,184,70,0.2)] rounded-xl px-4 py-2 w-full outline-none focus:border-brand-primary font-bold text-white transition-all"
                                            />
                                        ) : (
                                            <span className="font-bold group-hover:text-brand-primary transition-colors">{customer.name}</span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        {editingUserId === customer.id ? (
                                            <input 
                                                type="text" 
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                                className="bg-surface-base border border-brand-primary/50 shadow-[0_0_15px_rgba(225,184,70,0.2)] font-mono rounded-xl px-4 py-2 w-full outline-none focus:border-brand-primary font-bold text-white transition-all"
                                            />
                                        ) : (
                                            <span className="font-mono text-gray-300 font-bold">{customer.phone}</span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <span className="inline-block bg-brand-primary/10 border border-brand-primary/20 rounded-lg px-3 py-1.5 text-xs text-brand-primary font-black uppercase tracking-widest">{customer.zone || 'Nules (Villa)'}</span>
                                    </td>
                                    <td className="p-6">
                                        {editingUserId === customer.id ? (
                                            <input 
                                                type="text" 
                                                value={editForm.address}
                                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                                className="bg-surface-base border border-brand-primary/50 shadow-[0_0_15px_rgba(225,184,70,0.2)] rounded-xl px-4 py-2 w-full outline-none focus:border-brand-primary font-bold text-white transition-all"
                                            />
                                        ) : (
                                            <span className="text-gray-400 truncate max-w-[250px] block font-bold" title={customer.address}>{customer.address || '-'}</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        {editingUserId === customer.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={handleSaveEdit} className="p-2 bg-green-500/20 text-green-400 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg" title="Guardar">
                                                    <Save size={18} />
                                                </button>
                                                <button onClick={() => setEditingUserId(null)} className="p-2 bg-white/10 text-white rounded-xl hover:scale-110 active:scale-95 transition-all" title="Cancelar">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => navigate('/cart', { state: { customerPhone: customer.phone, customerName: customer.name, customerAddress: customer.address } })} className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-xl transition-all hover:scale-110 active:scale-95" title="Crear Nuevo Pedido">
                                                    <ShoppingCart size={18} />
                                                </button>
                                                <button onClick={() => handleEditClick(customer)} className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all hover:scale-110 active:scale-95" title="Editar">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(customer.id)} className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-all hover:scale-110 active:scale-95" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
                                        {searchTerm ? 'No se encontraron resultados para la búsqueda.' : 'No hay clientes en la base de datos.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-white/5 bg-surface-base/50 flex flex-col sm:flex-row items-center justify-between text-sm gap-4 relative z-10 font-bold">
                        <span className="text-gray-400 uppercase tracking-widest text-xs">
                            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} de <span className="text-white">{filteredCustomers.length}</span>
                        </span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-base hover:bg-white/10 disabled:opacity-30 disabled:scale-100 disabled:hover:bg-surface-base border border-white/10 hover:border-brand-primary/50 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="px-4 text-brand-primary uppercase tracking-[0.2em] text-xs">
                                Pág {currentPage} / {totalPages}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-base hover:bg-white/10 disabled:opacity-30 disabled:scale-100 disabled:hover:bg-surface-base border border-white/10 hover:border-brand-primary/50 transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
