import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update any existing active:scale-95 to active:scale-[0.97]
content = content.replace(/active:scale-95\b/g, 'active:scale-[0.97]');
content = content.replace(/active:scale-\[0\.98\]\b/g, 'active:scale-[0.97]');

// Find all buttons and add active:scale-[0.97] and transition-transform if not present
content = content.replace(/(<button[^>]*className=["'])([^"']*?)(["'])/g, (match, prefix, classes, suffix) => {
    let classList = classes.split(' ').filter((c: string) => c.trim().length > 0);
    
    if (!classList.some((c: string) => c.startsWith('active:scale-'))) {
        classList.push('active:scale-[0.97]');
    }
    
    if (!classList.some((c: string) => c.startsWith('transition'))) {
        classList.push('transition-transform');
    }
    
    return prefix + classList.join(' ') + suffix;
});

content = content.replace(/(<button[^>]*className=\{`)([^`]*?)(`\})/g, (match, prefix, classes, suffix) => {
    let classList = classes.split(' ').filter((c: string) => c.trim().length > 0);
    
    if (!classList.some((c: string) => c.startsWith('active:scale-'))) {
        classList.push('active:scale-[0.97]');
    }
    
    if (!classList.some((c: string) => c.startsWith('transition'))) {
        classList.push('transition-transform');
    }
    
    return prefix + classList.join(' ') + suffix;
});

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
