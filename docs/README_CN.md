# Arcadia Node

Arcadia Node 是一个基于区块链的分布式服务节点系统，提供基础服务和扩展服务的注册、发现和管理功能。
[INTRODUCTION](./INTRODUCTION.md)
[MODULE_LOGICS](./MODULE_LOGICS.md)
[FEATURES](./FEATURES.md)
[QUICK_START](./QUICK_START.md)

## 功能特点

- 节点注册与验证
- 服务注册与发现
- 用户认证管理
- 区块链交互
- 可扩展的服务架构
- 健康检查机制

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8.0
- 支持的操作系统：Linux, macOS, Windows

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/cmuba/arcadia-node.git
cd arcadia-node
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

4. 启动服务
```bash
# 开发模式
pnpm dev

# 生产模式
pnpm start
```

5. 访问服务
- 打开浏览器访问：http://localhost:3000
- 查看服务列表和 API 文档
- 使用内置的 API 测试工具进行接口测试

### 目录结构

```
root/
├── node_modules/        # 所有依赖
├── data/               # 服务配置数据
│   └── service_list.json # 服务列表配置
├── docs/               # 项目文档
│   └── design.md       # 系统设计文档
├── .env                # 环境变量
├── .env.example        # 环境变量示例
├── app.js             # 主入口文件
├── package.json       # 项目配置
│
├── server/            # 基础服务
│   ├── node/         # 节点服务
│   ├── service/      # 服务发现
│   ├── user/         # 用户服务
│   ├── chain/        # 链服务
│   └── health/       # 健康检查
│
└── serverx/          # 扩展服务
    ├── gamex/        # 游戏服务
    ├── comment/      # 评论服务
    ├── item/         # 物品服务
    └── asset/        # 资产服务
```

## 开发指南

详细的开发文档请参考 [docs/design.md](docs/design.md)。

## 许可证

MIT 