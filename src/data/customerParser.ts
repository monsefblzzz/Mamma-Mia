import { rawCustomersText } from './clientes1';
import { rawCustomersText2 } from './clientes2';
import { rawCustomersText3 } from './clientes3';
import { rawCustomersText4 } from './clientes4';
import { rawCustomersText5 } from './clientes5';
import { rawCustomersText6 } from './clientes6';

export const detectZone = (address: string, town: string = ''): string => {
    const fullText = `${address} ${town}`.toLowerCase();
    
    // Nules Playa keywords
    if (fullText.includes('playa') || 
        fullText.includes('marítimo') || 
        fullText.includes('maritimos') || 
        fullText.includes('maritimo') ||
        fullText.includes('marítimos') ||
        fullText.includes('primera linea') ||
        fullText.includes('mallorca') || // Avda. Mallorca is Playa
        fullText.includes('plana baixa')) { // Avda. Plana Baixa is Playa
        return 'Playa de Nules';
    }
    
    // Vilavella keywords
    if (fullText.includes('villavieja') || fullText.includes('vilavella')) {
        return 'La Vilavella';
    }
    
    // Burriana
    if (fullText.includes('burriana') || fullText.includes('borriana')) {
        return 'Burriana';
    }
    
    // Moncofa
    if (fullText.includes('moncofa') || fullText.includes('moncofar')) {
        return 'Moncofa';
    }
    
    // Alqueries
    if (fullText.includes('alqueries') || fullText.includes('alqueria')) {
        return 'Les Alqueries';
    }
    
    // Vall d'Uixo
    if (fullText.includes('uixó') || fullText.includes('uixo')) {
       return 'Vall d\'Uixó';
    }

    // Default 
    return 'Nules (Villa)';
}

export const getAllRawCustomers = () => {
    return [
        rawCustomersText,
        rawCustomersText2,
        rawCustomersText3,
        rawCustomersText4,
        rawCustomersText5,
        rawCustomersText6
    ].join('\n');
};

export const parseTxtCustomers = (text: string) => {
    const lines = text.split('\n');
    const newCustomers: any[] = [];
    
    lines.forEach(line => {
        // Many records are separated by '---' or end with it
        if (line.includes('---') && !line.startsWith('---  c/')) {
            const parts = line.split(/\s{2,}/);
            if (parts.length >= 3) {
                let name = parts[0].trim();
                if (name.startsWith('-') || name === '') {
                    name = 'Desconocido';
                }
                const address = parts[1].trim();
                
                const phoneIndex = parts.findIndex(p => /^[0-9\s]{6,15}$/.test(p.trim()));
                const phonePart = phoneIndex !== -1 ? parts[phoneIndex] : undefined;
                const phone = phonePart ? phonePart.replace(/\s+/g, '').trim() : '';

                // Text between address and phone is usually the town
                const town = phoneIndex > 2 ? parts.slice(2, phoneIndex).join(', ').trim() : '';
                const zone = detectZone(address, town);

                if (phone) {
                    newCustomers.push({
                        id: Math.random().toString(36).substring(2, 9),
                        name: name,
                        address: address + (town ? ` - ${town}` : ''),
                        phone: phone,
                        zone: zone,
                        role: 'CLIENTE'
                    });
                }
            }
        }
    });
    return newCustomers;
}

export const parseCsvCustomers = (text: string) => {
    // Normalizamos separadores y retornos
    const lines = text.replace(/\r/g, '').split('\n');
    const newCustomers: any[] = [];
    if (lines.length < 2) return [];
    
    // Función simple para parsear CSV respetando comillas
    const parseCsvLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result.map(s => s.trim().replace(/^"|"$/g, ''));
    };

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('nombre') || h.includes('name') || h.includes('cliente'));
    const phoneIdx = headers.findIndex(h => h.includes('telefono') || h.includes('phone') || h.includes('teléfono'));
    const addressIdx = headers.findIndex(h => h.includes('direccion') || h.includes('address') || h.includes('dirección'));
    
    // Si no encontramos las cabeceras requeridas, intentamos mapear por orden si hay 3 o más columnas.
    const fallback = nameIdx === -1 && phoneIdx === -1;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = parseCsvLine(line);
        
        let name = 'Desconocido';
        let address = '';
        let phoneRaw = '';

        if (fallback) {
             name = parts[0] || 'Desconocido';
             phoneRaw = parts[1] || '';
             address = parts[2] || '';
        } else {
             name = nameIdx !== -1 && parts[nameIdx] ? parts[nameIdx] : 'Desconocido';
             address = addressIdx !== -1 && parts[addressIdx] ? parts[addressIdx] : '';
             phoneRaw = phoneIdx !== -1 && parts[phoneIdx] ? parts[phoneIdx] : '';
        }

        const phone = phoneRaw.replace(/\D/g, '');
        
        if (phone.length >= 6) {
           newCustomers.push({
               id: Math.random().toString(36).substring(2, 9),
               name, address, zone: detectZone(address), phone, role: 'CLIENTE'
           });
        }
    }
    return newCustomers;
}

export const parseJsonCustomers = (text: string) => {
    try {
        const data = JSON.parse(text);
        const arr = Array.isArray(data) ? data : [data];
        const newCustomers: any[] = [];
        
        arr.forEach(item => {
            const phoneRaw = typeof item.phone === 'string' ? item.phone : typeof item.telefono === 'string' ? item.telefono : String(item.phone || item.telefono || '');
            const phone = phoneRaw.replace(/\D/g, '');
            if (phone.length >= 6) {
                const address = item.address || item.direccion || '';
                newCustomers.push({
                    id: Math.random().toString(36).substring(2, 9),
                    name: item.name || item.nombre || 'Desconocido',
                    address: address,
                    zone: item.zone || detectZone(address),
                    phone,
                    role: 'CLIENTE'
                });
            }
        });
        return newCustomers;
    } catch {
        return [];
    }
}

export const parseRawCustomers = () => {
    const text = getAllRawCustomers();
    return parseTxtCustomers(text);
};
