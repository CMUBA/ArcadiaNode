# Arcadia Node

Arcadia Node is a blockchain-based distributed service node system that provides registration, discovery, and management capabilities for basic and extended services.

[中文文档](README_CN.md)

## Features

- Node Registration and Verification
- Service Registration and Discovery
- User Authentication Management
- Blockchain Interaction
- Extensible Service Architecture
- Health Check Mechanism

## Quick Start

### Requirements

- Node.js >= 16
- pnpm >= 8.0
- Supported OS: Linux, macOS, Windows

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/cmuba/arcadia-node.git
cd arcadia-node
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit the .env file to set necessary environment variables
```

4. Start the service
```bash
# Development mode
pnpm dev

# Production mode
pnpm start
```

5. Access the service
- Open browser and visit: http://localhost:3000
- View service list and API documentation
- Use built-in API testing tool for interface testing

### Directory Structure

```
root/
├── node_modules/        # All dependencies
├── data/               # Service configuration data
│   └── service_list.json # Service list configuration
├── docs/               # Project documentation
│   └── design.md       # System design document
├── .env                # Environment variables
├── .env.example        # Environment variables example
├── app.js             # Main entry file
├── package.json       # Project configuration
│
├── server/            # Basic services
│   ├── node/         # Node service
│   ├── service/      # Service discovery
│   ├── user/         # User service
│   ├── chain/        # Chain service
│   └── health/       # Health check
│
└── serverx/          # Extended services
    ├── gamex/        # Game service
    ├── comment/      # Comment service
    ├── item/         # Item service
    └── asset/        # Asset service
```

## Development Guide

For detailed development documentation, please refer to [docs/design.md](docs/design.md).

## License

MIT


----
└─[$] ls                                                                                                                                                                                         [19:21:31]
broadcast      cache          clean-build.sh deploy.js      env.example    foundry.toml   lib            out            remappings.txt script         src            test
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/contract/optimism] - [10210]
└─[$] git status                                                                                                                                                                                 [20:43:26]
On branch jhf-dev
Your branch is up to date with 'origin/jhf-dev'.

nothing to commit, working tree clean
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/contract/optimism] - [10211]
└─[$] git checkout 4e189e0e6a38c88b73e217fb7e5aa91c3d858e4e                                                                                                                                      [20:43:28]
Note: switching to '4e189e0e6a38c88b73e217fb7e5aa91c3d858e4e'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 4e189e0 add new node ok
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/contract/optimism] - [10212]
└─[$] git checkout jhf-dev                                                                                                                                                                       [20:43:43]
Previous HEAD position was 4e189e0 add new node ok
Switched to branch 'jhf-dev'
Your branch is up to date with 'origin/jhf-dev'.
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/contract/optimism] - [10213]
└─[$] ls                                                                                                                                                                                         [20:45:41]
broadcast      cache          clean-build.sh deploy.js      env.example    foundry.toml   lib            out            remappings.txt script         src            test
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/contract/optimism] - [10240]
└─[$] cd ..                                                                                                                                                                                      [22:46:45]
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/contract] - [10241]
└─[$] pwd                                                                                                                                                                                        [22:46:50]
/Users/jason/dev/Community/move/ArcadiaNode/contract
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/contract] - [10242]
└─[$] cd ..                                                                                                                                                                                      [22:46:51]
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode] - [10243]
└─[$] cd server                                                                                                                                                                                  [22:46:53]
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/server] - [10244]
└─[$] ls                                                                                                                                                                                         [22:46:56]
chain          env.js         health         index.js       node           node_modules   package.json   pnpm-lock.yaml public         service        start.sh       user
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/server] - [10245]
└─[$] ./start.sh                                                                                                                                                                                 [22:46:58]
Server running on http://localhost:3017
Available routes:
- GET  /
- GET  /api/v1/node/get-challenge
- POST /api/v1/node/register
^C
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/server] - [10246]
└─[$] ./start.sh                                                                                                                                                                                 [22:51:33]
Server running on http://localhost:3017
Available routes:
- GET  /
- GET  /api/v1/node/get-challenge
- POST /api/v1/node/register
Challenge verification: {
  receivedChallenge: '63f5e9b1671d0953ca9d979ead38787b5abd2d8962342a89405d45a35287e1ae',
  storedChallenges: [
    '63f5e9b1671d0953ca9d979ead38787b5abd2d8962342a89405d45a35287e1ae'
  ],
  challengeData: { expires: 1738425436, used: false },
  currentTime: 1738425141
}
Verifying signature for challenge: 63f5e9b1671d0953ca9d979ead38787b5abd2d8962342a89405d45a35287e1ae
Signature: 0x8832515607cbfd08cbdf7f516917a076c99eaf88a6f2dbfe0b3b40a73bac473e25650997949da59cf6cd68396c6354142f7f269affbce876434023e06604ac161c
Node address: 0xec8692fCe349016d0fdA7A4E0E962e19952B47Dd
Message hash: 0x56cb906bb4711f5ee5854a15b4f43c31737fc861a398c847ef4a49b4686a1625
Recovered address: 0xec8692fCe349016d0fdA7A4E0E962e19952B47Dd
Signature verified successfully
Initializing provider with RPC URL: https://opt-sepolia.g.alchemy.com/v2/GyzNf_EiQiun2BgYRnXLmgWFZNpLVF1J
Creating contract instance at address: 0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4
Contract call params: {
  nodeAddress: '0xec8692fCe349016d0fdA7A4E0E962e19952B47Dd',
  nodeUrl: 'node.cmuba.org',
  apiIndexes: '[1,2,3,4,5,6,7,8,9,10,11,12,13]',
  challenge: '0xa3a30919858b407ad00faef70603ddcc72895cf4316a4108d05b1b09b211d622',
  signature: '0x8832515607cbfd08cbdf7f516917a076c99eaf88a6f2dbfe0b3b40a73bac473e25650997949da59cf6cd68396c6354142f7f269affbce876434023e06604ac161c'
}
Calling registerNode function...
Registration process failed: Error: execution reverted: "Invalid signature" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000", reason="Invalid signature", transaction={ "data": "0x1cd8c9d1000000000000000000000000ec8692fce349016d0fda7a4e0e962e19952b47dd00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0a3a30919858b407ad00faef70603ddcc72895cf4316a4108d05b1b09b211d6220000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d0000000000000000000000000000000000000000000000000000000000000000418832515607cbfd08cbdf7f516917a076c99eaf88a6f2dbfe0b3b40a73bac473e25650997949da59cf6cd68396c6354142f7f269affbce876434023e06604ac161c00000000000000000000000000000000000000000000000000000000000000", "from": "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA", "to": "0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4" }, invocation=null, revert={ "args": [ "Invalid signature" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.13.5)
    at makeError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/utils/errors.js:129:21)
    at getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:105:37)
    at AbiCoder.getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:206:16)
    at JsonRpcProvider.getRpcError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:676:43)
    at /Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:302:45
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  code: 'CALL_EXCEPTION',
  action: 'estimateGas',
  data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000',
  reason: 'Invalid signature',
  transaction: {
    to: '0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4',
    data: '0x1cd8c9d1000000000000000000000000ec8692fce349016d0fda7a4e0e962e19952b47dd00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0a3a30919858b407ad00faef70603ddcc72895cf4316a4108d05b1b09b211d6220000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d0000000000000000000000000000000000000000000000000000000000000000418832515607cbfd08cbdf7f516917a076c99eaf88a6f2dbfe0b3b40a73bac473e25650997949da59cf6cd68396c6354142f7f269affbce876434023e06604ac161c00000000000000000000000000000000000000000000000000000000000000',
    from: '0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA'
  },
  invocation: null,
  revert: {
    signature: 'Error(string)',
    name: 'Error',
    args: [ 'Invalid signature' ]
  },
  shortMessage: 'execution reverted: "Invalid signature"',
  info: {
    error: {
      code: 3,
      message: 'execution reverted: Invalid signature',
      data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000'
    },
    payload: {
      method: 'eth_estimateGas',
      params: [Array],
      id: 3,
      jsonrpc: '2.0'
    }
  }
}
Error details: {
  message: 'execution reverted: "Invalid signature" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000", reason="Invalid signature", transaction={ "data": "0x1cd8c9d1000000000000000000000000ec8692fce349016d0fda7a4e0e962e19952b47dd00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0a3a30919858b407ad00faef70603ddcc72895cf4316a4108d05b1b09b211d6220000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d0000000000000000000000000000000000000000000000000000000000000000418832515607cbfd08cbdf7f516917a076c99eaf88a6f2dbfe0b3b40a73bac473e25650997949da59cf6cd68396c6354142f7f269affbce876434023e06604ac161c00000000000000000000000000000000000000000000000000000000000000", "from": "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA", "to": "0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4" }, invocation=null, revert={ "args": [ "Invalid signature" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.13.5)',
  stack: 'Error: execution reverted: "Invalid signature" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000", reason="Invalid signature", transaction={ "data": "0x1cd8c9d1000000000000000000000000ec8692fce349016d0fda7a4e0e962e19952b47dd00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0a3a30919858b407ad00faef70603ddcc72895cf4316a4108d05b1b09b211d6220000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d0000000000000000000000000000000000000000000000000000000000000000418832515607cbfd08cbdf7f516917a076c99eaf88a6f2dbfe0b3b40a73bac473e25650997949da59cf6cd68396c6354142f7f269affbce876434023e06604ac161c00000000000000000000000000000000000000000000000000000000000000", "from": "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA", "to": "0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4" }, invocation=null, revert={ "args": [ "Invalid signature" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.13.5)\n' +
    '    at makeError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/utils/errors.js:129:21)\n' +
    '    at getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:105:37)\n' +
    '    at AbiCoder.getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:206:16)\n' +
    '    at JsonRpcProvider.getRpcError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:676:43)\n' +
    '    at /Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:302:45\n' +
    '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)',
  code: 'CALL_EXCEPTION',
  reason: 'Invalid signature'
}
^C
┌─[jason@HuifengjiaodeMacBook-Pro-3] - [~/dev/Community/move/ArcadiaNode/server] - [10246]
└─[$] ./start.sh                                                                                                                                                                                 [23:11:49]
Server running on http://localhost:3017
Available routes:
- GET  /
- GET  /api/v1/node/get-challenge
- POST /api/v1/node/register
Challenge verification: {
  receivedChallenge: '8f2621882d43eeec41ab9cfb3717fbb71d1a5728ef1eee905ba03df06e89aa73',
  storedChallenges: [
    '8f2621882d43eeec41ab9cfb3717fbb71d1a5728ef1eee905ba03df06e89aa73'
  ],
  challengeData: { expires: 1738426699, used: false },
  currentTime: 1738426403
}
Verifying signature for challenge: 8f2621882d43eeec41ab9cfb3717fbb71d1a5728ef1eee905ba03df06e89aa73
Signature: 0x90a0ac80f211294e603a3f176c7104a4314cbd8d434e33a5f99e5afecaf8345e17b25a0ac77de46d61caeaa316f68cc40c3903324e378fa4c78172b6579255a11b
Node address: 0x3A654C6f98aF67c50B85D1EFD85C5Cd6256569A8
Recovered address: 0x3A654C6f98aF67c50B85D1EFD85C5Cd6256569A8
Signature verified successfully
Initializing provider with RPC URL: https://opt-sepolia.g.alchemy.com/v2/GyzNf_EiQiun2BgYRnXLmgWFZNpLVF1J
Creating contract instance at address: 0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4
Contract call params: {
  nodeAddress: '0x3A654C6f98aF67c50B85D1EFD85C5Cd6256569A8',
  nodeUrl: 'node.cmuba.org',
  apiIndexes: '[1,2,3,4,5,6,7,8,9,10,11,12,13]',
  challenge: '0xd066ddb47d434a1df85f49d362c10ca712748e0f9419b56ca162f6e7335bd13e',
  signature: '0x90a0ac80f211294e603a3f176c7104a4314cbd8d434e33a5f99e5afecaf8345e17b25a0ac77de46d61caeaa316f68cc40c3903324e378fa4c78172b6579255a11b'
}
Calling registerNode function...
Registration process failed: Error: execution reverted: "Invalid signature" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000", reason="Invalid signature", transaction={ "data": "0x1cd8c9d10000000000000000000000003a654c6f98af67c50b85d1efd85c5cd6256569a800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0d066ddb47d434a1df85f49d362c10ca712748e0f9419b56ca162f6e7335bd13e0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d00000000000000000000000000000000000000000000000000000000000000004190a0ac80f211294e603a3f176c7104a4314cbd8d434e33a5f99e5afecaf8345e17b25a0ac77de46d61caeaa316f68cc40c3903324e378fa4c78172b6579255a11b00000000000000000000000000000000000000000000000000000000000000", "from": "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA", "to": "0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4" }, invocation=null, revert={ "args": [ "Invalid signature" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.13.5)
    at makeError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/utils/errors.js:129:21)
    at getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:105:37)
    at AbiCoder.getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:206:16)
    at JsonRpcProvider.getRpcError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:676:43)
    at /Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:302:45
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  code: 'CALL_EXCEPTION',
  action: 'estimateGas',
  data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000',
  reason: 'Invalid signature',
  transaction: {
    to: '0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4',
    data: '0x1cd8c9d10000000000000000000000003a654c6f98af67c50b85d1efd85c5cd6256569a800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0d066ddb47d434a1df85f49d362c10ca712748e0f9419b56ca162f6e7335bd13e0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d00000000000000000000000000000000000000000000000000000000000000004190a0ac80f211294e603a3f176c7104a4314cbd8d434e33a5f99e5afecaf8345e17b25a0ac77de46d61caeaa316f68cc40c3903324e378fa4c78172b6579255a11b00000000000000000000000000000000000000000000000000000000000000',
    from: '0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA'
  },
  invocation: null,
  revert: {
    signature: 'Error(string)',
    name: 'Error',
    args: [ 'Invalid signature' ]
  },
  shortMessage: 'execution reverted: "Invalid signature"',
  info: {
    error: {
      code: 3,
      message: 'execution reverted: Invalid signature',
      data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000'
    },
    payload: {
      method: 'eth_estimateGas',
      params: [Array],
      id: 3,
      jsonrpc: '2.0'
    }
  }
}
Error details: {
  message: 'execution reverted: "Invalid signature" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000", reason="Invalid signature", transaction={ "data": "0x1cd8c9d10000000000000000000000003a654c6f98af67c50b85d1efd85c5cd6256569a800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0d066ddb47d434a1df85f49d362c10ca712748e0f9419b56ca162f6e7335bd13e0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d00000000000000000000000000000000000000000000000000000000000000004190a0ac80f211294e603a3f176c7104a4314cbd8d434e33a5f99e5afecaf8345e17b25a0ac77de46d61caeaa316f68cc40c3903324e378fa4c78172b6579255a11b00000000000000000000000000000000000000000000000000000000000000", "from": "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA", "to": "0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4" }, invocation=null, revert={ "args": [ "Invalid signature" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.13.5)',
  stack: 'Error: execution reverted: "Invalid signature" (action="estimateGas", data="0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011496e76616c6964207369676e6174757265000000000000000000000000000000", reason="Invalid signature", transaction={ "data": "0x1cd8c9d10000000000000000000000003a654c6f98af67c50b85d1efd85c5cd6256569a800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0d066ddb47d434a1df85f49d362c10ca712748e0f9419b56ca162f6e7335bd13e0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d00000000000000000000000000000000000000000000000000000000000000004190a0ac80f211294e603a3f176c7104a4314cbd8d434e33a5f99e5afecaf8345e17b25a0ac77de46d61caeaa316f68cc40c3903324e378fa4c78172b6579255a11b00000000000000000000000000000000000000000000000000000000000000", "from": "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA", "to": "0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4" }, invocation=null, revert={ "args": [ "Invalid signature" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.13.5)\n' +
    '    at makeError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/utils/errors.js:129:21)\n' +
    '    at getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:105:37)\n' +
    '    at AbiCoder.getBuiltinCallException (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/abi/abi-coder.js:206:16)\n' +
    '    at JsonRpcProvider.getRpcError (/Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:676:43)\n' +
    '    at /Users/jason/Dev/Community/move/ArcadiaNode/server/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.commonjs/providers/provider-jsonrpc.js:302:45\n' +
    '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)',
  code: 'CALL_EXCEPTION',
  reason: 'Invalid signature'
}
00000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0d066ddb47d434a1df85f49d362c10ca712748e0f9419b56ca162f6e7335bd13e0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000e6e6f64652e636d7562612e6f7267000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f5b312c322c332c342c352c362c372c382c392c31302c31312c31322c31335d00000000000000000000000000000000000000000000000000000000000000004190a0ac80f211294e603a3f176c7104a4314cbd8d434e33a5f99e5afecaf8345e17b25a0ac77de46d61caeaa316f68cc40c3903324e378fa4c78172b6579255a11b00000000000000000000000000000000000000000000000000000000000000", "from": "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA", "to": "0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4" }, invocation=null, revert={ "args": [ "Invalid signature" ], "name": "Error", "signature": "Error(string)" }, code=CALL_EXCEPTION, version=6.13.5)\n' +