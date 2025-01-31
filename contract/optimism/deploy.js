require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('node:fs');
const path = require('node:path');

// 读取合约编译后的 ABI 和字节码
const contractPath = path.resolve(__dirname, 'NodeRegistry.sol');
const contractSource = fs.readFileSync(contractPath, 'utf8');
const compiledContract = JSON.parse(contractSource);

// 使用 .env 文件中的私钥
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.OP_TESTNET_RPC_URL);
const wallet = new ethers.Wallet(privateKey, provider);

async function deploy() {
    console.log('Deploying contract...');

    // 创建合约工厂
    const factory = new ethers.ContractFactory(compiledContract.abi, compiledContract.bytecode, wallet);

    // 部署合约
    const contract = await factory.deploy();
    await contract.deployed();

    console.log('Contract deployed at:', contract.address);

    // 将合约地址写入 .env 文件
    fs.appendFileSync('.env', `\nNODE_REGISTRY_CONTRACT_ADDRESS=${contract.address}\n`);
}

deploy().catch((error) => {
    console.error('Error deploying contract:', error);
}); 