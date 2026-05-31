import * as fs from 'fs';

function enhance(file: string) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    let modified = content;

    // Layout
    modified = modified.replace(/transition-all duration-200/g, 'transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]');
    modified = modified.replace(/transition-colors cursor-pointer/g, 'transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer active:scale-[0.97]');
    
    // Cards
    modified = modified.replace(/cursor-pointer hover:shadow/g, 'cursor-pointer active:scale-[0.97] hover:shadow');
    modified = modified.replace(/duration-300 ease-\[cubic-bezier\(0\.23,1,0\.32,1\)\]/g, 'duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]');
    
    // Snappy buttons inside cards
    modified = modified.replace(/hover:bg-brand-primary hover:text-black transition-all/g, 'hover:bg-brand-primary hover:text-black transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]');
    
    // Make sure we have proper CSS ease config in globals so we can just use `ease-out-strong`
    fs.writeFileSync(file, modified);
    console.log(`Updated ${file}`);
}

enhance('src/App.tsx');
enhance('src/components/Layout.tsx');
