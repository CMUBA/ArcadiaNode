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

