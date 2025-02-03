const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

class DiscussPlugin {
  constructor(config) {
    this.config = config;
    this.router = express.Router();
    this.dataDir = path.join(process.cwd(), 'data', 'discuss');
    this.indexFile = path.join(this.dataDir, 'post-index.json');
    
    // 使用 QuickNode IPFS
    const apiKey = process.env.IPFS_QUICKNODE_API_KEY;
    if (!apiKey) {
      throw new Error('IPFS_QUICKNODE_API_KEY is required');
    }

    this.ipfsConfig = {
      baseURL: config.ipfs.api,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    };

    this.setupRoutes();
  }

  async uploadToIPFS(content) {
    const response = await fetch(`${this.ipfsConfig.baseURL}/pinning/pinJson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.ipfsConfig.headers
      },
      body: JSON.stringify(content)
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to IPFS: ${response.statusText}`);
    }

    const result = await response.json();
    return result.cid;
  }

  async getFromIPFS(cid) {
    const response = await fetch(`${this.config.ipfs.gateway}/ipfs/${cid}`, {
      headers: this.ipfsConfig.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get from IPFS: ${response.statusText}`);
    }

    return response.json();
  }

  async init() {
    // 确保数据目录存在
    await fs.mkdir(this.dataDir, { recursive: true });
    
    // 初始化索引文件
    try {
      await fs.access(this.indexFile);
    } catch {
      await fs.writeFile(this.indexFile, JSON.stringify({
        categories: [],
        posts: [],
        lastUpdate: Date.now()
      }));
    }
  }

  setupRoutes() {
    // 获取所有帖子
    this.router.get('/posts', async (req, res) => {
      try {
        const { category, tag } = req.query;
        const posts = await this.getAllPosts();
        
        let filteredPosts = posts;
        if (category) {
          filteredPosts = filteredPosts.filter(post => post.category === category);
        }
        if (tag) {
          filteredPosts = filteredPosts.filter(post => post.tags.includes(tag));
        }
        
        res.json(filteredPosts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取所有分类
    this.router.get('/categories', async (req, res) => {
      try {
        const index = await this.getIndex();
        res.json(index.categories);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 创建新帖子
    this.router.post('/posts', async (req, res) => {
      try {
        const { title, content, author, category, tags = [] } = req.body;
        const post = {
          title,
          content,
          author,
          category,
          tags,
          timestamp: Date.now(),
          comments: []
        };
        
        // 将帖子内容上传到IPFS
        const cid = await this.uploadToIPFS(post);
        
        // 更新帖子列表
        await this.addPostToIndex(cid, post);
        
        res.json({ 
          success: true, 
          cid,
          post 
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取特定帖子
    this.router.get('/posts/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const post = await this.getFromIPFS(id);
        res.json(post);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 添加评论
    this.router.post('/posts/:id/comments', async (req, res) => {
      try {
        const { id } = req.params;
        const { content, author } = req.body;
        const comment = {
          content,
          author,
          timestamp: Date.now()
        };

        const post = await this.getFromIPFS(id);
        post.comments.push(comment);
        
        // 更新帖子内容
        const newCid = await this.uploadToIPFS(post);
        
        // 更新索引中的CID
        await this.updatePostCid(id, newCid);
        
        res.json({ success: true, comment, newCid });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async getIndex() {
    const data = await fs.readFile(this.indexFile, 'utf-8');
    return JSON.parse(data);
  }

  async saveIndex(index) {
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
  }

  async getAllPosts() {
    const index = await this.getIndex();
    return index.posts;
  }

  async addPostToIndex(cid, postSummary) {
    const index = await this.getIndex();
    
    // 添加新分类（如果不存在）
    if (postSummary.category && !index.categories.includes(postSummary.category)) {
      index.categories.push(postSummary.category);
    }
    
    // 添加帖子摘要
    index.posts.push({
      cid,
      title: postSummary.title,
      author: postSummary.author,
      category: postSummary.category,
      tags: postSummary.tags,
      timestamp: postSummary.timestamp
    });
    
    index.lastUpdate = Date.now();
    await this.saveIndex(index);
  }

  async updatePostCid(oldCid, newCid) {
    const index = await this.getIndex();
    const postIndex = index.posts.findIndex(p => p.cid === oldCid);
    if (postIndex !== -1) {
      index.posts[postIndex].cid = newCid;
      await this.saveIndex(index);
    }
  }

  // 插件生命周期方法
  async start() {
    await this.init();
    console.log('Discussion plugin started');
  }

  async stop() {
    console.log('Discussion plugin stopped');
  }

  async healthCheck() {
    try {
      // 测试 IPFS 连接
      const testContent = { test: 'health check' };
      const cid = await this.uploadToIPFS(testContent);
      const retrieved = await this.getFromIPFS(cid);
      
      const index = await this.getIndex();
      return { 
        status: 'healthy',
        posts: index.posts.length,
        categories: index.categories.length,
        lastUpdate: index.lastUpdate,
        ipfs: 'connected'
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        ipfs: 'disconnected'
      };
    }
  }
}

module.exports = {
  createPlugin: config => new DiscussPlugin(config)
}; 