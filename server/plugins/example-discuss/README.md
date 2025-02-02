# ArcadiaNode Discussion Plugin

A decentralized discussion forum plugin for ArcadiaNode that uses IPFS for content storage and Ethereum for access control.

## Features

- Create discussion topics
- Post replies and comments
- Upvote/downvote content
- Tag and categorize discussions
- Search functionality
- IPFS-based content storage
- Ethereum-based access control

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build the plugin:
```bash
npm run build
```

4. Start the service:
```bash
npm start
```

## API Endpoints

### Topics
- `GET /api/topics` - List all topics
- `POST /api/topics` - Create new topic
- `GET /api/topics/:id` - Get topic details
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic

### Comments
- `GET /api/topics/:id/comments` - List comments
- `POST /api/topics/:id/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Architecture

The plugin follows a modular architecture:

- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/models/` - Data models
- `src/utils/` - Helper functions
- `src/types/` - TypeScript type definitions

## IPFS Integration

Content is stored on IPFS with the following structure:
- Topics and comments are stored as JSON objects
- Media attachments are stored directly
- Content addressing ensures data integrity
- IPFS hashes are stored in smart contracts for reference

## Smart Contracts

The plugin uses the following smart contracts:
- `DiscussionRegistry.sol` - Manages topic and comment registrations
- `AccessControl.sol` - Handles user permissions
- `Voting.sol` - Manages content voting system

## Health Check

The plugin implements the ArcadiaNode health check protocol:
- Regular IPFS connectivity checks
- Smart contract interaction verification
- API endpoint availability monitoring
- Resource usage tracking

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 