import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logosDir = path.join(__dirname, '../public/logos');
const manifestPath = path.join(__dirname, '../public/logos-manifest.json');

function getLogosFromDirectory(dir, relativePath = '') {
    const items = [];
    
    if (!fs.existsSync(dir)) {
        console.warn(`Logos directory does not exist: ${dir}`);
        return items;
    }
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            const folderName = file;
            const subItems = getLogosFromDirectory(filePath, path.join(relativePath, folderName));
            items.push(...subItems);
        } else if (file.endsWith('.svg')) {
            const folder = path.basename(path.dirname(filePath));
            items.push({
                name: file,
                folder: folder === 'logos' ? 'root' : folder,
                path: path.join(relativePath, file).replace(/\\/g, '/')
            });
        }
    }
    
    return items;
}

console.log('Generating logos manifest...');
const logos = getLogosFromDirectory(logosDir);
console.log(`Found ${logos.length} SVG files`);

// Sort by name
logos.sort((a, b) => a.name.localeCompare(b.name));

// Write manifest
fs.writeFileSync(manifestPath, JSON.stringify(logos, null, 2));
console.log(`Manifest written to: ${manifestPath}`);

// Log some statistics
const folderStats = logos.reduce((acc, logo) => {
    acc[logo.folder] = (acc[logo.folder] || 0) + 1;
    return acc;
}, {});

console.log('Folders:', Object.entries(folderStats).map(([folder, count]) => `${folder}: ${count}`).join(', '));