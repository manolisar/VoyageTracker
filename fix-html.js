import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read the built HTML file
const htmlPath = join(process.cwd(), 'dist', 'index.html');
let html = readFileSync(htmlPath, 'utf-8');

// Remove type="module" from script tags since we're using IIFE format
html = html.replace(/type="module"\s+crossorigin/g, 'crossorigin');
html = html.replace(/crossorigin\s+type="module"/g, 'crossorigin');

// Write the fixed HTML back
writeFileSync(htmlPath, html, 'utf-8');

console.log('✓ Fixed HTML: Removed type="module" attribute');
