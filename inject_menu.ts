import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('MenuSelectionModal')) {
    content = content.replace(
      "import { AddressAutocomplete } from './components/AddressAutocomplete';", 
      "import { AddressAutocomplete } from './components/AddressAutocomplete';\nimport { MenuSelectionModal } from './components/MenuSelectionModal';"
    );
}

content = content.replace(
  "const [activeDietFilters, setActiveDietFilters] = React.useState<string[]>([]);",
  "const [activeDietFilters, setActiveDietFilters] = React.useState<string[]>([]);\n  const [comboModalItem, setComboModalItem] = React.useState<any>(null);\n\n  const handleConfirmCombo = (item: any, notes: string, additionalCost: number) => {\n    const comboItem = {\n      ...item,\n      id: item.id + '-' + Date.now(),\n      price: item.price + additionalCost\n    };\n    addToCart(comboItem, 1, notes);\n    setAddedItem(item.id);\n    const badgeId = Date.now();\n    setBadges(prev => [...prev, { id: badgeId, itemId: item.id }]);\n    setTimeout(() => { setBadges(prev => prev.filter(b => b.id !== badgeId)); }, 1000);\n    toast.success(`¡Ménu especial añadido al pedido!`, { icon: '🍕', position: 'top-center' });\n    setTimeout(() => { setAddedItem(null); }, 2000);\n  };"
);

content = content.replace(
  "const handleAddToCart = (e: React.MouseEvent, item: any) => {\n    e.stopPropagation();\n    addToCart(item);",
  "const handleAddToCart = (e: React.MouseEvent, item: any) => {\n    e.stopPropagation();\n    if (item.category === 'Menús Especiales') {\n      setComboModalItem(item);\n      return;\n    }\n    addToCart(item);"
);

content = content.replace(
  "    <AnimatePresence>\n      {cart.length > 0 && (",
  "    <MenuSelectionModal \n       isOpen={!!comboModalItem}\n       onClose={() => setComboModalItem(null)}\n       onConfirm={handleConfirmCombo}\n       baseItem={comboModalItem}\n     />\n\n    <AnimatePresence>\n      {cart.length > 0 && ("
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx modified');
