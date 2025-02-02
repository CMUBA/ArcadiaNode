import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';
import { routes } from './router.js';

// 初始化环境变量
dotenv.config();

// 获取 __dirname (在 ESM 中不直接可用)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3008;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// 页面路由
for (const [path, config] of Object.entries(routes)) {
    app.get(path, (req, res) => {
        res.sendFile(join(__dirname, config.page));
    });
}

// 404 处理
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Client application running on http://localhost:${PORT}`);
}); 