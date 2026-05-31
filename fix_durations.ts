import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace long durations with responsive ones
content = content.replace(/\bduration-700\b/g, 'duration-300');
content = content.replace(/\bduration-500\b/g, 'duration-300');

// Use custom easings
// We can't easily add global css easings here unless we use arbitrary values like `ease-[cubic-bezier(0.23,1,0.32,1)]` 
// Let's replace `ease-out` with `ease-[cubic-bezier(0.23,1,0.32,1)]` where we can.
content = content.replace(/\bease-out\b/g, 'ease-[cubic-bezier(0.23,1,0.32,1)]');

// Also update Framer Motion durations
content = content.replace(/duration:\s*0\.7/g, 'duration: 0.25');
content = content.replace(/duration:\s*0\.5/g, 'duration: 0.25');
content = content.replace(/duration:\s*0\.4/g, 'duration: 0.25');
content = content.replace(/duration:\s*0\.3/g, 'duration: 0.2');

// Fix button press animations (if any were missed)
fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx duration updated');
