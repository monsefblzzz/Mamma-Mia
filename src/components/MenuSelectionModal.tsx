import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { MenuItem } from '../types';
import { useStore } from '../context/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, notes: string, additionalCost: number) => void;
  baseItem: MenuItem | null;
}

export const MenuSelectionModal = ({ isOpen, onClose, onConfirm, baseItem }: Props) => {
  const { menuItems } = useStore();
  
  const [selectedPizza, setSelectedPizza] = useState('');
  const [selectedBebida, setSelectedBebida] = useState('');
  const [selectedAperitivo, setSelectedAperitivo] = useState('');
  const [selectedAcompanamiento, setSelectedAcompanamiento] = useState('Patatas'); // Patatas, Ensalada (+2€)
  const [selectedSalsa, setSelectedSalsa] = useState('Ninguna'); // Ninguna, Salsa (+0.5€)
  
  if (!isOpen || !baseItem) return null;

  const pizzas = menuItems.filter(i => i.category === 'Pizzas' || i.category === 'Hamburguesas' || i.category === 'Bocadillos'); // let them choose something? "Pizza"
  const pizzasOnly = menuItems.filter(i => i.category === 'Pizzas');
  const bebidas = menuItems.filter(i => i.category === 'Bebidas');
  const aperitivos = menuItems.filter(i => i.category === 'Aperitivos');
  const ensaladas = menuItems.filter(i => i.category === 'Ensaladas');

  const salsas = [
    'Ninguna',
    'Mayonesa',
    'Ketchup',
    'Salsa Barbacoa',
    'Salsa Brava',
    'Salsa Arándanos',
    'Salsa Mojo Picón',
    'Salsa Baconesa',
    'Salsa Miel y Mostaza'
  ];

  let additionalCost = 0;
  if (selectedAcompanamiento === 'Ensalada') additionalCost += 2;
  if (selectedSalsa !== 'Ninguna') additionalCost += 0.5;

  const handleConfirm = () => {
    if (!selectedPizza || !selectedBebida || !selectedAperitivo) {
       // Ideally show an error or just return
       return;
    }
    const notes = [
      `Principal: ${selectedPizza}`,
      `Bebida: ${selectedBebida}`,
      `Aperitivo: ${selectedAperitivo}`,
      `Acompañamiento: ${selectedAcompanamiento}${selectedAcompanamiento === 'Ensalada' ? ' (+2€)' : ''}`,
      selectedSalsa !== 'Ninguna' ? `Salsa: ${selectedSalsa} (+0.5€)` : null
    ].filter(Boolean).join('\n');

    onConfirm(baseItem, notes, additionalCost);
    // Reset
    setSelectedPizza('');
    setSelectedBebida('');
    setSelectedAperitivo('');
    setSelectedAcompanamiento('Patatas');
    setSelectedSalsa('Ninguna');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-[0.98] duration-300">
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-surface-base sticky top-0 z-10">
            <h2 className="text-2xl font-black font-display uppercase tracking-wider text-brand-primary">Configura tu Menú</h2>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            {/* Principal */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-brand-primary text-black flex items-center justify-center text-xs">1</span> 
                 Elige tu Principal (Pizza)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {pizzasOnly.map(p => (
                   <button 
                     key={p.id}
                     onClick={() => setSelectedPizza(p.name)}
                     className={`p-3 text-sm rounded-xl border text-left transition-all active:scale-[0.97] ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedPizza === p.name ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-white/5 hover:border-white/20'}`}
                   >
                     {p.name}
                   </button>
                 ))}
              </div>
            </div>

            {/* Aperitivo */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-brand-primary text-black flex items-center justify-center text-xs">2</span> 
                 Elige tu Aperitivo (1/2 Ración)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 {aperitivos.map(a => (
                   <button 
                     key={a.id}
                     onClick={() => setSelectedAperitivo(a.name)}
                     className={`p-3 text-sm rounded-xl border text-left transition-all active:scale-[0.97] ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedAperitivo === a.name ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-white/5 hover:border-white/20'}`}
                   >
                     {a.name}
                   </button>
                 ))}
              </div>
            </div>
            
            {/* Bebida */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-brand-primary text-black flex items-center justify-center text-xs">3</span> 
                 Elige tu Bebida
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 {bebidas.map(b => (
                   <button 
                     key={b.id}
                     onClick={() => setSelectedBebida(b.name)}
                     className={`p-3 text-sm rounded-xl border text-left transition-all active:scale-[0.97] ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedBebida === b.name ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-white/5 hover:border-white/20'}`}
                   >
                     {b.name}
                   </button>
                 ))}
              </div>
            </div>

            {/* Acompañamiento */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-brand-primary text-black flex items-center justify-center text-xs">4</span> 
                 Ensalada o Patatas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setSelectedAcompanamiento('Patatas')}
                  className={`p-4 text-sm rounded-xl border text-center transition-all active:scale-[0.97] ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedAcompanamiento === 'Patatas' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-white/5 hover:border-white/20'}`}
                >
                  <span className="block text-base mb-1">🍟 Patatas Fritas</span>
                  <span className="text-xs opacity-70">Incluido</span>
                </button>
                <button 
                  onClick={() => setSelectedAcompanamiento('Ensalada')}
                  className={`p-4 text-sm rounded-xl border text-center transition-all active:scale-[0.97] ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedAcompanamiento === 'Ensalada' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-white/5 hover:border-white/20'}`}
                >
                  <span className="block text-base mb-1">🥗 Ensalada</span>
                  <span className="text-xs opacity-70 text-brand-yellow">+2.00€</span>
                </button>
              </div>
            </div>

            {/* Salsa */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-brand-primary text-black flex items-center justify-center text-xs">5</span> 
                 Salsa Opcional (+0.50€)
              </h3>
              <div className="flex flex-wrap gap-2">
                 {salsas.map(s => (
                   <button 
                     key={s}
                     onClick={() => setSelectedSalsa(s)}
                     className={`px-4 py-2 text-sm rounded-full border transition-all active:scale-[0.97] ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedSalsa === s ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold' : 'border-white/5 hover:border-white/20 bg-surface-container'}`}
                   >
                     {s}
                   </button>
                 ))}
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-white/5 bg-surface-base sticky bottom-0 z-10 flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">Total</p>
                <p className="text-3xl font-display font-black text-brand-primary">{(baseItem.price + additionalCost).toFixed(2)}€</p>
            </div>
            
            <button 
              onClick={handleConfirm}
              disabled={!selectedPizza || !selectedBebida || !selectedAperitivo}
              className="bg-brand-primary text-black font-black uppercase text-sm px-8 py-4 rounded-xl hover:scale-105 active:scale-[0.97] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              <Check size={20} /> Añadir al Pedido
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
