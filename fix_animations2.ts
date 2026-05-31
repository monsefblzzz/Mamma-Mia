import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace('animate-in fade-in duration-300 relative', 'animate-in fade-in zoom-in-[0.98] duration-300 relative');
fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx animations updated');
