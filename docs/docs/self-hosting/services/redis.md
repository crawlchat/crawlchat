---
sidebar_position: 6
---
# Redis Service

## Overview

The Redis service provides an in-memory data store used primarily for queue management in the CrawlChat application. It powers the BullMQ job queues used by the source-sync service for processing background tasks.

### Architecture & Features

- **Database Engine**: Redis 7
- **Persistence**: Append Only File (AOF) persistence enabled for durability
- **Memory Management**: In-memory storage with optional persistence
- **Queue Support**: Powers BullMQ job queues for background processing
- **Health Checks**: Built-in health monitoring
- **Performance**: High-performance key-value store
- **Port**: Not exposed externally (internal only)

### Dependencies

- None (standalone service)

## Environment Variables

Redis service doesn't require specific environment variables for basic setup. The default configuration uses:
- Port: 6379 (internal)
- AOF persistence: enabled
- Health checks: enabled

## Running Locally

### Prerequisites

- Docker and Docker Compose (recommended)
- Or Redis installed directly on your system

### Docker Setup (Recommended)

The Redis service is typically run via Docker Compose as part of the full application stack. See the "Run via Docker" section for complete setup instructions.

### Direct Redis Installation

If running Redis directly without Docker:

1. **Install Redis 7**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server

   # macOS with Homebrew
   brew install redis

   # Or follow official installation guide
   ```

2. **Configure Redis** (optional):
   Edit `/etc/redis/redis.conf` to enable AOF:
   ```
   appendonly yes
   ```

3. **Start Redis service**:
   ```bash
   # System service
   sudo systemctl start redis-server

   # Or direct
   redis-server /etc/redis/redis.conf
   ```

### Connection String

Use this connection URL in your application services:
```
redis://redis:6379
```
(or `redis://localhost:6379` when running locally without Docker)

### Data Persistence

- **Docker**: Data is stored in the `crawlchat_redis_data` Docker volume
- **Direct**: AOF files are typically stored in `/var/lib/redis/` or configured data directory

### Monitoring

- **Docker logs**: `docker-compose logs redis`
- **Direct monitoring**: Use `redis-cli` to connect and monitor:
  ```bash
  redis-cli
  > INFO
  > KEYS *
  ```

### Queue Monitoring

To monitor BullMQ queues:
- Use Redis CLI to inspect queue keys
- Check source-sync service logs for job processing status
- Monitor queue lengths and job states programmatically