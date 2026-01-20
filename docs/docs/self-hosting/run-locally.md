---
sidebar_position: 2
---

# Run Locally

This guide covers running CrawlChat services locally for development and testing purposes. Each service can be run independently, allowing for focused development on specific components.

## Prerequisites

Before running services locally, ensure you have:

1. **Node.js**: Version 20+ (front), 22+ (server, source-sync, discord-bot, slack-app)
2. **Python**: Version 3.8+ (marker service)
3. **MongoDB**: Version 7+ running locally or accessible
4. **Redis**: Version 7+ running locally or accessible
5. **External API Keys**:
   - Pinecone API key
   - OpenRouter API key
6. **Optional Dependencies**:
   - Discord bot credentials (for discord-bot service)
   - Slack app credentials (for slack-app service)

## Service Overview

### Required Services

Start these core services first:

1. **Database** (MongoDB)
2. **Redis**
3. **Server**
4. **Front**

### Optional Services

Add these based on your needs:

5. **Source Sync** (for knowledge base management)
6. **Marker** (for file processing)
7. **Discord Bot** (for Discord integration)
8. **Slack App** (for Slack integration)

## Local Development Setup

### 1. Database and Redis Setup

```bash
# Start MongoDB and Redis using the local compose file
docker-compose -f docker-compose-local.yml up -d

# Wait for MongoDB replica set to initialize (mongo-init service will handle this automatically)
# This may take 30-60 seconds
```

This will start:
- **MongoDB** on `localhost:27017` with replica set `rs0` initialized
- **Redis** on `localhost:6379` with AOF persistence enabled
- **mongo-init** service that automatically initializes the replica set

### 2. Environment Configuration

Copy the `.env.example` from each service into `.env` with this command, and fill them out to your needs:

```bash
`cp .env.example .env`
```

### 3. Start Services

See for each service it's respective page [here](https://docs.crawlchat.app/category/services)

## Testing the Setup

1. **Access the frontend**: http://localhost:5173
2. **Check server health**: http://localhost:3000/health (if implemented)
3. **Test API endpoints**: Use tools like Postman or curl
4. **Monitor logs**: Check each terminal for service logs

### Common Issues

#### Port Conflicts
If ports are in use, modify the ports in service configurations or use different ports.

#### Database Connection Issues
- Ensure MongoDB replica set is initialized (mongo-init service should handle this)
- Check DATABASE_URL format: `mongodb://localhost:27017/crawlchat?replicaSet=rs0`
- Check Docker containers: `docker-compose -f docker-compose-local.yml ps`
- View logs: `docker-compose -f docker-compose-local.yml logs database`

#### Redis Connection Issues
- Ensure Redis is running and healthy
- Check REDIS_URL configuration: `redis://localhost:6379`
- Check Docker containers: `docker-compose -f docker-compose-local.yml ps`
- View logs: `docker-compose -f docker-compose-local.yml logs redis`

#### API Key Issues
- Verify all required API keys are set
- Check key formats and permissions
- Test API keys independently

## Stopping Services

To stop the database and Redis services:
```bash
docker-compose -f docker-compose-local.yml down
```

To stop and remove volumes (reset all data):
```bash
docker-compose -f docker-compose-local.yml down -v
```