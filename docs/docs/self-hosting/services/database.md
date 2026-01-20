---
sidebar_position: 2
---
# Database Service (MongoDB)

## Overview

The Database service provides MongoDB as the primary data store for CrawlChat. It stores user data, conversations, knowledge base metadata, and application state using a replica set configuration for development and testing.

### Architecture & Features

- **Database Engine**: MongoDB 7
- **Replica Set**: Configured with replica set name `rs0` for transactions and high availability
- **Authentication**: Disabled for self-hosting (no username/password required)
- **Persistence**: Persistent volume storage for data durability
- **Health Checks**: Built-in health monitoring
- **Initialization**: Automatic replica set initialization via mongo-init service
- **Port**: Not exposed externally (internal only)

### Dependencies

- None (standalone database service)

## Environment Variables

MongoDB service doesn't require specific environment variables for basic self-hosting setup. The default configuration uses:
- Database name: `crawlchat`
- Replica set name: `rs0`
- No authentication enabled

## Running Locally

### Prerequisites

- Docker and Docker Compose (recommended)
- Or MongoDB installed directly on your system

### Docker Setup (Recommended)

The database service is typically run via Docker Compose as part of the full application stack. See the "Run via Docker" section for complete setup instructions.

### Direct MongoDB Installation

If running MongoDB directly without Docker:

1. **Install MongoDB 7**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS with Homebrew
   brew install mongodb/brew/mongodb-community

   # Or follow official installation guide
   ```

2. **Start MongoDB with replica set**:
   ```bash
   mongod --replSet rs0 --dbpath /path/to/data/directory
   ```

3. **Initialize replica set**:
   ```bash
   mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
   ```

### Connection String

Use this connection string in your application services:
```
mongodb://localhost:27017/crawlchat?replicaSet=rs0
```

### Data Persistence

- **Docker**: Data is stored in the `crawlchat_mongo_data` Docker volume
- **Direct**: Ensure the data directory has proper permissions and backup strategy

### Monitoring

- **Docker logs**: `docker-compose logs database`
- **Direct connection**: Use MongoDB Compass or `mongosh` to connect and monitor