import fs from 'node:fs/promises';
import path from 'node:path';

async function install() {
  try {
    // 创建必要的目录
    const dirs = [
      'data',
      'logs',
      'config'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true });
    }

    // 复制默认配置文件
    const defaultConfig = {
      ipfsEndpoint: 'http://localhost:5001',
      userServiceEndpoint: 'http://localhost:3017/api/v1/user',
      apiPort: 3018
    };

    await fs.writeFile(
      path.join(__dirname, 'config', 'default.json'),
      JSON.stringify(defaultConfig, null, 2)
    );

    console.log('Discuss plugin installed successfully');
  } catch (error) {
    console.error('Failed to install discuss plugin:', error);
    process.exit(1);
  }
}

install(); 