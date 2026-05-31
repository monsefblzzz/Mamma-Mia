import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace standard transition with a nice spring for entry/exit
content = content.replace(/transition=\{\{( duration: 0\.2(?:, ease: 'easeOut')? )\}\}/g, 'transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}');
content = content.replace(/transition=\{\{ duration: 0\.2 \}\}/g, 'transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}');
content = content.replace(/cursor-pointer"/g, 'cursor-pointer active:scale-[0.98]"'); // For custom clickable items

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx springs updated');
