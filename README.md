# Arcadia Node

A decentralized node management system for the Arcadia network.

## Project Structure

```
arcadia-node/
├── client/           # Frontend application
├── server/           # Backend server
│   └── plugins/      # Server plugins
│       └── serverx/  # Extended API services
├── contract/         # Smart contracts
├── data/            # Data storage
└── docs/            # Documentation
```

## Development

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

