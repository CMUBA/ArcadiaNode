# Arcadia Node

A decentralized node management system for the Arcadia network.

## Features

Node Registration and Verification
Service Registration and Discovery
User Authentication Management
Blockchain Interaction
Extensible Service Architecture
Health Check Mechanism

## Project Structure

```
arcadia-node/
├── client/           # Frontend application
├── server/           # Backend server
│   └── plugins/      # Extended API services
├── contract/         # Smart contracts
├── data/            # Data storage
└── docs/            # Documentation
```

## Development

### Optimism sepolia test contract

TOKEN_CONTRACT_ADDRESS=0xBda48255DA1ed61a209641144Dd24696926aF3F0
STAKE_MANAGER_ADDRESS=0xf7081161f19FB6246c1931aABd4fbe890DbdE8c4
NODE_REGISTRY_ADDRESS=0xE1A3B41be95Ff379DBDFd194680d26b5d8786462

history node registry: '0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4'


### Prerequisites

- Node.js 18+
- pnpm
- Foundry (for smart contracts)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/arcadia-node.git
cd arcadia-node
```

2. Install dependencies:
```bash
# Install client dependencies
cd client && pnpm install

# Install server dependencies
cd ../server && pnpm install
```

3. Configure environment:
```bash
# Configure client
cd client
cp .env.example .env

# Configure server
cd ../server
cp .env.example .env
```

### Development

Start all services:
```bash
./dev.sh start
```

Stop all services:
```bash
./dev.sh stop
```

### Project Components

- **Client**: Vue.js based frontend application
- **Server**: Node.js backend server with plugin system
- **Contracts**: Solidity smart contracts for node management
- **Data**: Persistent data storage
- **Docs**: Project documentation

## License

[MIT License](LICENSE)

