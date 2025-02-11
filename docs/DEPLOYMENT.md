# Deployment
管理员初始化部署分为三部分：client端部署，server端部署，contract部署以及数据初始化的操作。
而普通节点可以选择源代码部署或者Docker脚本部署，只需要完成client端部署，server端部署。

## 1. client端部署
### 操作步骤
1. client目录下运行 pnpm install
2. client目录下运行 pnpm build
3. client目录下运行 pnpm run start
4. git merge dev into main
5. config netlify or vercel .env

### 部署结果
1. build不报错
2. run不报错
3. merge 不冲突
4. netlify vercel内部域名访问是否ok
5. config .env后重启
6. 验证核心交互场景 

### 测试结果
1. pnpm run test测试（覆盖所有关键场景）
2. 依赖的server API测试



## 2. server端部署

## 3. contract部署

### optimism(Node)
1. forge clean&&forge build
2. forge test -vvvv
3. run script/deploy-*.sh
4. script/copy_abis.sh

### hero(EVM)
1. forge clean&&forge build
2. forge test -vvvv
3. deploy-all.sh 

### aptos(APT)
1. aptos move build
2. aptos move test


## 4. 数据初始化的操作
1. 脚本中包含
2. 初始化后进行查询和测试，是否和设计的数据结构一致

## 5. Docker脚本生成