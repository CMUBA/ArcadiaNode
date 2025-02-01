import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const routes = {
    '/': {
        page: 'index.html'
    },
    '/pages/node-register.html': {
        page: 'pages/node-register.html'
    },
    '/pages/node-health.html': {
        page: 'pages/node-health.html'
    },
    '/pages/service-manage.html': {
        page: 'pages/service-manage.html'
    },
    '/pages/user-manage.html': {
        page: 'pages/user-manage.html'
    },
    '/pages/chain-interact.html': {
        page: 'pages/chain-interact.html'
    },
    '/pages/node-registry-info.html': {
        page: 'pages/node-registry-info.html'
    }
}; 