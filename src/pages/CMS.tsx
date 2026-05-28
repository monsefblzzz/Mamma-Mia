import React, { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { useStore } from '../context/StoreContext';
import { MenuItem } from '../types';
import { Pencil, Trash2, Plus, X, Image as ImageIcon, UtensilsCrossed, GripVertical, Sparkles, Check, Wheat, Nut, Milk, Fish, Egg, Vegan, QrCode, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const AllergyIcons = ({ info }: { info: string | undefined }) => {
  if (!info) return null;
  const lowercase = info.toLowerCase();
  
  const tags = [];
  if (lowercase.includes('gluten') || lowercase.includes('trigo')) tags.push({ Icon: Wheat, title: 'Gluten' });
  if (lowercase.includes('frutos secos') || lowercase.includes('nuez') || lowercase.includes('cacahuete')) tags.push({ Icon: Nut, title: 'Frutos secos' });
  if (lowercase.includes('lactosa') || lowercase.includes('leche') || lowercase.includes('queso')) tags.push({ Icon: Milk, title: 'Lácteos' });
  if (lowercase.includes('pescado') || lowercase.includes('atún') || lowercase.includes('marisco')) tags.push({ Icon: Fish, title: 'Pescado/Marisco' });
  if (lowercase.includes('huevo')) tags.push({ Icon: Egg, title: 'Huevo' });
  if (lowercase.includes('vegan')) tags.push({ Icon: Vegan, title: 'Vegano' });

  if (tags.length === 0) return <div className="text-[10px] text-gray-500 max-w-[80px] truncate" title={info}>{info}</div>;

  return (
    <div className="flex gap-1 items-center bg-black/40 py-1 px-1.5 rounded-lg border border-white/5" title={info}>
      {tags.map((t, i) => (
        <t.Icon key={i} size={12} className="text-gray-400 cursor-help" />
      ))}
    </div>
  );
};

const SortableMenuItem: React.FC<{ 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onShowQR: (item: MenuItem) => void;
}> = ({ item, onEdit, onDelete, onShowQR }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-surface-container rounded-2xl border border-white/5 flex flex-col group relative overflow-visible hover:z-30">
      {/* Quick View Modal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] bg-surface-container-high border-2 border-brand-primary/30 rounded-3xl p-6 shadow-2xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all delay-500 z-50 pointer-events-none scale-95 group-hover:scale-100 hidden md:block">
         <div className="h-40 w-full rounded-2xl overflow-hidden mb-4 bg-black/50">
           {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
           ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <UtensilsCrossed size={32} className="opacity-20" />
              </div>
           )}
         </div>
         <h4 className="font-black uppercase text-white text-xl mb-1">{item.name}</h4>
         <p className="font-bold text-brand-yellow mb-3">€{item.price.toFixed(2)}</p>
         <p className="text-sm text-gray-300 mb-4">{item.description}</p>
         <div className="flex gap-2 flex-wrap">
            {item.tags?.map(tag => (
              <span key={tag} className="inline-block px-2 py-1 bg-brand-primary/20 text-brand-primary rounded-lg text-xs font-bold">
                #{tag}
              </span>
            ))}
         </div>
         {item.stock !== undefined && (
            <p className="mt-4 text-xs font-bold text-gray-400">
               Stock disponible: <span className="text-white">{item.stock}</span>
            </p>
         )}
      </div>

      <div className="rounded-2xl overflow-hidden flex flex-col h-full relative">
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-md cursor-grab active:cursor-grabbing z-20 hover:bg-black/80 transition-colors backdrop-blur-sm"
          title="Arrastrar para ordenar"
        >
          <GripVertical size={16} />
        </div>
        {item.isPopular && (
          <div className="absolute top-2 left-12 px-2 py-1 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-md z-20 shadow-lg">
            Popular
          </div>
        )}
        <div className="h-48 bg-black/50 relative overflow-hidden shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
               <UtensilsCrossed size={32} className="opacity-20 mb-2" />
               <span className="text-xs font-bold uppercase">Sin imagen</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto">
            <button onClick={() => onShowQR(item)} className="bg-brand-secondary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer">
              <QrCode size={14} />
            </button>
            <button onClick={() => onEdit(item)} className="bg-brand-yellow text-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(item.id)} className="bg-brand-red text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col items-start text-left">
          <div className="flex justify-between items-start mb-2 gap-2 w-full">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
               <h4 className="font-black uppercase text-white truncate">{item.name}</h4>
               <AllergyIcons info={item.allergy_info} />
            </div>
            <span className="font-bold text-brand-yellow shrink-0">€{item.price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 mb-2 flex-1 w-full">{item.description}</p>
          <div className="flex gap-2 flex-wrap w-full">
            <span className="inline-block px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400 w-max uppercase border border-white/10">
              {item.category}
            </span>
            {item.tags?.map(tag => (
              <span key={tag} className="inline-block px-2 py-1 bg-brand-primary/10 text-brand-primary rounded text-[10px] font-bold w-max border border-brand-primary/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SortableCategoryItem: React.FC<{ category: string }> = ({ category }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-surface-container-high rounded-xl border flex items-center gap-3 px-4 py-3 group relative hover:border-brand-primary/50 transition-colors ${isDragging ? 'border-brand-primary shadow-xl scale-105' : 'border-white/10'}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-gray-500 cursor-grab active:cursor-grabbing hover:text-brand-primary transition-colors"
      >
        <GripVertical size={20} />
      </div>
      <span className="font-bold text-white tracking-wide">{category}</span>
    </div>
  );
};



const AVAILABLE_TAGS = [
  'vegano', 'vegetariano', 'picante', 'sin gluten', 'nuevo', 
  'casero', 'para compartir', 'infantil', 'premium', 'especialidad'
];

const TagInput: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
}> = ({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const suggestions = AVAILABLE_TAGS.filter(
    t => t.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(t)
  );
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/^,+|,+$/g, '');
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };
  
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) onChange([...tags, tag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-2 min-h-[50px] flex flex-wrap gap-2 items-center focus-within:border-brand-primary transition-colors z-10 relative relative">
        {tags.map((tag, index) => (
          <span key={index} className="flex items-center gap-1 bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-lg text-sm font-bold">
            #{tag}
            <button 
              type="button" 
              onClick={() => removeTag(index)}
              className="hover:text-white hover:bg-brand-primary/50 w-5 h-5 rounded-full flex items-center justify-center transition-colors ml-1"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
             setInputValue(e.target.value);
             setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Escribe y pulsa Enter o Coma para añadir" : "Añadir más..."}
          className="flex-1 bg-transparent border-none outline-none text-white min-w-[200px] px-2 py-1 text-sm placeholder:text-gray-500"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-surface-container-high border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 shadow-2xl p-2 flex flex-col gap-1 rounded-b-2xl">
           {suggestions.map(tag => (
              <button
                 key={tag}
                 type="button"
                 onClick={() => addTag(tag)}
                 className="text-left px-3 py-2 text-sm text-gray-300 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors font-bold"
              >
                 #{tag}
              </button>
           ))}
        </div>
      )}
    </div>
  );
};

export function CMS() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems, categories, reorderCategories } = useStore();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Partial<MenuItem>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [qrItem, setQrItem] = useState<MenuItem | null>(null);
  const [sortByPopular, setSortByPopular] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDeleteMenuItem = (id: string) => {
    setItemToDelete(id);
  };
  
  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMenuItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = menuItems.findIndex((item) => item.id === active.id);
      const newIndex = menuItems.findIndex((item) => item.id === over?.id);
      
      const newItems = arrayMove(menuItems, oldIndex, newIndex);
      reorderMenuItems(newItems);
    }
  };

  const [activeTab, setActiveTab] = useState<'general' | 'recipe'>('general');

  const handleEdit = (item: MenuItem) => {
    setError(null);
    setEditingItem(item);
    setFormData(item);
    setIsAdding(false);
    setActiveTab('general');
  };

  const handleAddNew = () => {
    setError(null);
    setIsAdding(true);
    setEditingItem(null);
    setActiveTab('general');
    setFormData({
      id: 'n' + Date.now(),
      name: '',
      description: '',
      price: 0,
      category: 'Pizzas',
      image: '',
      tags: [],
      allergy_info: ''
    });
  };

  const generateImage = async () => {
    if (!formData.name) {
      setError("Por favor, introduce el nombre del plato antes de generar una imagen.");
      return;
    }
    
    setIsGeneratingImage(true);
    setError(null);
    
    try {
      const basePrompt = `Delicious ${formData.name}, food photography, high quality, appetizing`;
      const fullPrompt = encodeURIComponent(basePrompt);
      const newImageUrl = `https://image.pollinations.ai/prompt/${fullPrompt}?width=800&height=600&nologo=true`;
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setFormData(prev => ({ ...prev, image: newImageUrl }));
    } catch (err: any) {
      setError(err.message || 'Error al generar la imagen');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      setError('El campo Nombre no puede estar vacío.');
      return;
    }
    if (formData.price === undefined || formData.price === null || String(formData.price).trim() === '') {
      setError('El campo Precio no puede estar vacío.');
      return;
    }
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('El Precio debe ser un número positivo.');
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(String(formData.price))) {
      setError('El Precio debe tener un máximo de 2 decimales.');
      return;
    }
    
    if (formData.stock !== undefined && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
      setError('La Cantidad en Stock debe ser un número positivo.');
      return;
    }

    if (!formData.category?.trim()) {
      setError('El campo Categoría no puede estar vacío.');
      return;
    }

    setError(null);
    if (isAdding) {
      addMenuItem(formData as MenuItem);
      setIsAdding(false);
    } else if (editingItem) {
      updateMenuItem(editingItem.id, formData as MenuItem);
      setEditingItem(null);
    }
  };

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.indexOf(active.id as string);
      const newIndex = categories.indexOf(over.id as string);
      reorderCategories(arrayMove(categories, oldIndex, newIndex));
    }
  };

  const [isReorderingCategories, setIsReorderingCategories] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-0">
        <ConfirmModal
        isOpen={!!itemToDelete}
        title="Eliminar Plato"
        description="¿Estás seguro de que quieres eliminar este plato? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={confirmDelete}
        onClose={() => setItemToDelete(null)}
        type="danger"
      />

      {/* QR Modal */}
      {qrItem && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in relative" style={{ zIndex: 9999 }}>
            <div className="bg-surface-base border-2 border-brand-primary/50 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
                <button 
                  onClick={() => setQrItem(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="text-center">
                    <h3 className="text-2xl font-black text-brand-primary mb-2 uppercase">{qrItem.name}</h3>
                    <p className="text-sm text-gray-400 mb-6 font-bold uppercase tracking-widest">Escanea para ver</p>
                    <div className="bg-white p-4 rounded-2xl inline-block mb-6 relative group border-4 border-white">
                        <QRCodeSVG 
                           value={`${window.location.origin}/cliente?item=${qrItem.id}`} 
                           size={200}
                           id={`qr-${qrItem.id}`}
                        />
                    </div>
                    <div className="flex gap-4 w-full">
                        <button 
                           onClick={() => {
                               const svg = document.getElementById(`qr-${qrItem.id}`);
                               if (svg) {
                                  const svgData = new XMLSerializer().serializeToString(svg);
                                  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `qr-${qrItem.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.svg`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                               }
                           }}
                           className="flex-1 bg-surface-container hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] px-4 py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            <Download size={14} />
                            Guardar SVG
                        </button>
                    </div>
                </div>
            </div>
         </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-4xl font-display font-black text-brand-primary">CMS Menú</h2>
          <p className="text-gray-400 mt-1">Gestiona los platos, imágenes y descripciones.</p>
        </div>
        <button onClick={handleAddNew} className="bg-brand-yellow text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all outline-none whitespace-nowrap">
          <Plus className="inline mr-2" size={20} />
          Añadir Plato
        </button>
      </div>

      {(editingItem || isAdding) && (
        <div className="bg-surface-container rounded-3xl p-8 border-2 border-brand-primary/50 relative shadow-2xl">
          <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 rounded-full p-2 hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
          <h3 className="text-3xl font-display font-black text-white mb-8">
            {isAdding ? 'Nuevo Plato' : 'Editando Plato'}
          </h3>
          
          {error && (
             <div className="mb-6 bg-brand-red/10 border border-brand-red/50 text-brand-red px-4 py-3 rounded-xl font-bold flex items-center gap-3">
               <X size={20} />
               {error}
             </div>
          )}

          <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`font-bold uppercase tracking-widest text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === 'general' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('recipe')}
              className={`font-bold uppercase tracking-widest text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === 'recipe' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Receta
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {activeTab === 'general' ? (
              <div className="space-y-6">
                <div>
                  <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Nombre</label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Descripción</label>
                  <textarea 
                    value={formData.description || ''} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none min-h-[120px] resize-y"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Precio (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      value={formData.price || ''} 
                      onChange={e => setFormData({...formData, price: e.target.value === '' ? undefined : Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Cantidad en Stock</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Sin límite"
                      value={formData.stock === undefined ? '' : formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value === '' ? undefined : Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Categoría</label>
                    <select 
                      value={formData.category || 'Pizzas'} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none transition-colors appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      {!categories.includes(formData.category || '') && (
                        <option value={formData.category}>{formData.category}</option>
                      )}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Imagen URL</label>
                    <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={formData.image || ''} 
                          onChange={e => setFormData({...formData, image: e.target.value})}
                          placeholder="https://..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none transition-colors"
                        />
                        {formData.image && (
                            <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10" />
                        )}
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Etiquetas</label>
                    <TagInput
                      tags={formData.tags || []}
                      onChange={(tags) => setFormData({...formData, tags})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Alergenos</label>
                    <input 
                      type="text"
                      value={formData.allergy_info || ''} 
                      onChange={e => setFormData({...formData, allergy_info: e.target.value})}
                      placeholder="ej: Contiene gluten y lactosa"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer w-fit group">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${formData.isPopular ? 'bg-brand-primary border-brand-primary text-black' : 'border-white/30 group-hover:border-brand-primary/50'}`}>
                       <Check size={16} className={`transition-opacity ${formData.isPopular ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPopular || false}
                      onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                      className="hidden"
                    />
                    <span className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">Destacar como popular</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6 lg:col-span-1">
                <div>
                  <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Ingredientes</label>
                  <TagInput
                    tags={formData.recipe?.ingredients || []}
                    onChange={(ingredients) => setFormData({...formData, recipe: { ...formData.recipe, ingredients, steps: formData.recipe?.steps || [] }})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Escribe el ingrediente y presiona Enter o , (coma)</p>
                </div>
                <div>
                  <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block">Pasos de Preparación</label>
                  <div className="space-y-2">
                     {(formData.recipe?.steps || []).map((step, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                           <span className="text-brand-primary font-bold bg-brand-primary/10 w-6 h-6 flex items-center justify-center rounded-md shrink-0">{idx + 1}</span>
                           <textarea
                              value={step}
                              onChange={(e) => {
                                 const newSteps = [...(formData.recipe?.steps || [])];
                                 newSteps[idx] = e.target.value;
                                 setFormData({...formData, recipe: { ...formData.recipe, ingredients: formData.recipe?.ingredients || [], steps: newSteps }});
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white focus:border-brand-primary outline-none text-sm resize-y min-h-[60px]"
                           />
                           <button onClick={() => {
                                 const newSteps = [...(formData.recipe?.steps || [])];
                                 newSteps.splice(idx, 1);
                                 setFormData({...formData, recipe: { ...formData.recipe, ingredients: formData.recipe?.ingredients || [], steps: newSteps }});
                           }} className="text-gray-500 hover:text-brand-red p-1 shrink-0">
                               <X size={16} />
                           </button>
                        </div>
                     ))}
                     <button
                        onClick={() => {
                           const newSteps = [...(formData.recipe?.steps || []), ''];
                           setFormData({...formData, recipe: { ...formData.recipe, ingredients: formData.recipe?.ingredients || [], steps: newSteps }});
                        }}
                        className="text-sm font-bold text-brand-primary hover:text-brand-yellow flex items-center gap-2 mt-2 px-2 py-1 bg-brand-primary/10 rounded-lg w-max"
                     >
                        <Plus size={16} /> Añadir Paso
                     </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6 flex flex-col">
              <div>
                <label className="text-xs tracking-wider text-brand-primary font-bold uppercase mb-2 block flex justify-between items-center">
                  <span>URL Imagen</span>
                  <div className="flex gap-2">
                    <label className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-xs">
                      <span>Subir Imagen</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData(prev => ({...prev, image: reader.result as string}))
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button 
                      type="button" 
                      onClick={generateImage}
                      disabled={isGeneratingImage || !formData.name}
                      className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      <Sparkles size={14} className={isGeneratingImage ? "animate-spin" : ""} />
                      {isGeneratingImage ? 'Generando...' : 'Generate Placeholder Image'}
                    </button>
                  </div>
                </label>
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="https://... o sube una imagen"
                     value={formData.image || ''} 
                     onChange={e => setFormData({...formData, image: e.target.value})}
                     className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-brand-primary outline-none transition-colors text-ellipsis"
                   />
                </div>
              </div>
              <div className="flex-1 w-full min-h-[250px] rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden bg-black/20 group relative">
                {formData.image ? (
                  <img src={formData.image} alt={formData.name || 'Preview'} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-500 text-center flex flex-col items-center">
                    <ImageIcon size={64} className="mx-auto mb-4 opacity-20 group-hover:scale-110 transition-transform duration-500 group-hover:text-brand-primary" />
                    <p className="text-sm font-medium">No hay imagen para este plato</p>
                  </div>
                )}
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                    <Sparkles size={48} className="animate-pulse text-brand-yellow mb-4" />
                    <p className="font-bold text-lg animate-pulse tracking-widest uppercase">Diseñando...</p>
                  </div>
                )}
              </div>
              
              <div className="pt-6 flex justify-end">
                <button onClick={handleSave} className="bg-brand-primary text-black font-black px-10 py-4 rounded-xl hover:scale-105 hover:bg-brand-yellow transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,228,175,0.2)]">
                  <Check size={20} />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-center w-full md:w-auto">
               <div className="w-full md:w-64 relative">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-surface-container border-2 border-white/10 rounded-xl px-4 py-3 text-white font-bold appearance-none cursor-pointer focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Todas">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
               </div>
               
               <button 
                  onClick={() => setIsReorderingCategories(!isReorderingCategories)}
                  className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-colors whitespace-nowrap flex-shrink-0 ${isReorderingCategories ? 'bg-brand-primary border-brand-primary text-black' : 'bg-surface-container border-white/10 text-white hover:border-brand-primary/50'}`}
               >
                 Reordenar Categorías
               </button>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer bg-surface-container px-4 py-2 rounded-full border border-white/10 group hover:border-brand-primary/50 transition-colors">
               <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border-2 ${sortByPopular ? 'bg-brand-red border-brand-red text-white' : 'border-white/30 group-hover:border-brand-primary'}`}>
                  <Check size={14} className={`transition-opacity ${sortByPopular ? 'opacity-100' : 'opacity-0'}`} />
               </div>
               <input
                 type="checkbox"
                 checked={sortByPopular}
                 onChange={e => setSortByPopular(e.target.checked)}
                 className="hidden"
               />
               <span className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">Ordenar por popularidad</span>
            </label>
          </div>
          
          {isReorderingCategories && (
            <div className="bg-surface-container-high p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <GripVertical size={20} className="text-brand-primary" />
                Arrastra para reordenar las categorías
              </h3>
              <DndContext id="categories-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                <SortableContext items={categories} strategy={rectSortingStrategy}>
                  <div className="flex flex-wrap gap-4">
                    {categories.map(category => (
                      <SortableCategoryItem key={category} category={category} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {(selectedCategory === 'Todas' ? categories : [selectedCategory]).map(category => {
            const categoryItems = menuItems.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;
            
            if (sortByPopular) {
               categoryItems.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
            }
            
            return (
              <div key={category} className="space-y-6">
                <h3 className="text-3xl font-black text-brand-primary border-b border-white/10 pb-3 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-sm">{categoryItems.length}</span>
                  {category}
                </h3>
                <SortableContext items={categoryItems.map(i => i.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryItems.map(item => (
                      <SortableMenuItem 
                        key={item.id} 
                        item={item} 
                        onEdit={handleEdit} 
                        onDelete={handleDeleteMenuItem} 
                        onShowQR={setQrItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </DndContext>
      </div>
    </div>
  );
}

