import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        root: resolve(__dirname, 'src'),
        publicDir: resolve(__dirname, 'public'),
        build: {
            outDir: resolve(__dirname, 'dist'),
            emptyOutDir: true
        },
        server: {
            port: Number.parseInt(env.VITE_CLIENT_PORT || '3008', 10),
            proxy: {
                '/api/v1': {
                    target: `http://localhost:${env.VITE_SERVER_PORT || '3017'}`,
                    changeOrigin: true
                }
            }
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        }
    };
}); 