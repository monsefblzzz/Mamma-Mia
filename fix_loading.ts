import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Speed up loading dot animation
content = content.replace(/duration: 1\.5/g, 'duration: 0.8');

// Also make exit transitions faster than enter transitions in mode="wait"
// Find <AnimatePresence mode="wait"> ... <motion.div ... exit={{ opacity: 0 ... 
// Well, we can replace some common exit durations if they exist.

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx loading animations updated');
