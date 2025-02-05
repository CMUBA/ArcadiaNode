# Hero Plugin

这是 Arcadia Node 的英雄系统插件，提供与英雄合约交互的 API 接口。

## 功能

- 创建英雄
- 加载英雄数据
- 保存英雄数据
- NFT 相关操作

## API 接口

### 创建英雄
```http
POST /api/hero/create
Content-Type: application/json

{
    "userId": "number",
    "name": "string",
    "race": "number",
    "class": "number",
    "signer": "object"
}
```

### 加载英雄数据
```http
GET /api/hero/:heroId
```

### 保存英雄数据
```http
POST /api/hero/save
Content-Type: application/json

{
    "heroId": "number",
    "data": {
        "id": "number",
        "level": "number",
        "exp": "number",
        "createTime": "number",
        "lastSaveTime": "number",
        "signature": "string"
    },
    "nodeSignature": "string",
    "clientSignature": "string",
    "signer": "object"
}
```

### 获取 NFT 所有者
```http
GET /api/hero/nft/owner/:tokenId
```

### 检查 NFT 是否存在
```http
GET /api/hero/nft/exists/:tokenId
```

## 安装

1. 安装依赖：
```bash
npm install
```

2. 编译 TypeScript：
```bash
npm run build
```

## 配置

在使用插件前，需要配置以下环境变量：

- `PROVIDER_URL`: 以太坊节点 RPC URL
- `HERO_CONTRACT_ADDRESS`: Hero 合约地址
- `HERO_NFT_CONTRACT_ADDRESS`: HeroNFT 合约地址

## 使用示例

```typescript
import { HeroPlugin } from '@arcadia/hero-plugin';

const heroPlugin = new HeroPlugin(
    process.env.PROVIDER_URL,
    process.env.HERO_CONTRACT_ADDRESS,
    process.env.HERO_NFT_CONTRACT_ADDRESS
);

app.use('/api/hero', heroPlugin.getRouter());
``` 