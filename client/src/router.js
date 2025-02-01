import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const routes = {
    '/': {
        page: 'index.html'
    },
    '/pages/node-register.html': {
        page: 'pages/node-register.html'
    }
}; 