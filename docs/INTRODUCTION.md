# Arcadia Node 介绍
Arcadia Node Network 是一个去中心计算节点网络，服务于 Mycelium Protocol Network 的计算层。
Arcadia Node 是由 AAStar 和 CMUBA 共同研发的去中心计算节点服务核心。
任何人可以下载并运行这些节点服务，加入网络，向全球任何人提供计算服务。

## 概述
所有目录都是独立应用存在，client 依赖 server 提供外部 API 服务。
本项目是测试网阶段，包括下述核心目录：
### server 目录
节点的核心计算服务，包括基础服务和扩展插件服务，所有节点必须运行基础服务，插件服务可选。
### client 目录
用来展示（测试）和管理 server 节点能力的交互界面。
### data 目录
用来临时存储一些 metadata 的设计和范例
### docs 目录
用来完成 Arcadia Node 的设计工作，记录开发进展、变更和 Release。
### contract 目录
用来开发 Ethereum 和 Aptos 合约，未来会包括更多跨链合约。


