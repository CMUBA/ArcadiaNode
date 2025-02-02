import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd(), ['VITE_', '']);
    
    console.log('Loading environment variables from:', process.cwd());
    console.log('Current mode:', mode);
    console.log('Loaded environment variables:', {
        VITE_TOKEN_CONTRACT_ADDRESS: env.VITE_TOKEN_CONTRACT_ADDRESS,
        VITE_STAKE_MANAGER_ADDRESS: env.VITE_STAKE_MANAGER_ADDRESS,
        VITE_NODE_REGISTRY_ADDRESS: env.VITE_NODE_REGISTRY_ADDRESS
    });

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
        },
        envPrefix: 'VITE_'
    };
}); 