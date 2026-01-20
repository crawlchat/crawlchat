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

#### Option A: Docker Compose (Recommended)
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

#### Option B: Local Installation
```bash
# Install and start MongoDB locally
# Follow the MongoDB installation guide for your OS
mongod --replSet rs0 --dbpath /path/to/data
mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'

# Install and start Redis locally
redis-server
```

### 3. Environment Configuration

Create environment files for each service. You can use the Docker Compose file as a reference for the required variables.

**Common variables** (set these in each service's `.env` file):
```bash
SELF_HOSTED=true
DATABASE_URL=mongodb://localhost:27017/crawlchat?replicaSet=rs0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Start Services

Open multiple terminals and start each service:

#### Terminal 1: Server Service
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:3000 (dev) / 3002 (prod)
```

#### Terminal 2: Front Service
```bash
cd front
npm install
npm run dev
# Runs on http://localhost:5173 (dev) / 3001 (prod)
```

#### Terminal 3: Source Sync Service (Optional)
```bash
cd source-sync
npm install
npx playwright install  # For web scraping
npm run dev
# Runs on http://localhost:3000 (dev) / 3003 (prod)
```

#### Terminal 4: Marker Service (Optional)
```bash
cd marker
pip install -r requirements.txt
fastapi run main.py --port 3005
# Runs on http://localhost:3005
```

#### Terminal 5: Discord Bot (Optional)
```bash
cd discord-bot
npm install
npm run dev
# No web port - connects to Discord
```

#### Terminal 6: Slack App (Optional)
```bash
cd slack-app
npm install
npm run dev
# Runs on http://localhost:3000 (dev) / 3004 (prod)
```

## Development URLs

When running locally, update your environment variables to use local development URLs:

```bash
# Front service .env
VITE_APP_URL=http://localhost:5173
VITE_SERVER_WS_URL=ws://localhost:3000
VITE_SERVER_URL=http://localhost:3000
VITE_SOURCE_SYNC_URL=http://localhost:3000
MARKER_HOST=http://localhost:3005

# Server service .env
SOURCE_SYNC_URL=http://localhost:3000

# Discord/Slack services .env
SERVER_HOST=http://localhost:3000
```

## Testing the Setup

1. **Access the frontend**: http://localhost:5173
2. **Check server health**: http://localhost:3000/health (if implemented)
3. **Test API endpoints**: Use tools like Postman or curl
4. **Monitor logs**: Check each terminal for service logs

## Development Tips

### Hot Reload
Most services support hot reload during development:
- Front: Automatic with Vite
- Server/Source-Sync/Bots: Automatic with nodemon
- Marker: Manual restart required

### Debugging
- Use `console.log` for quick debugging
- Most services support debugger attachment
- Check individual service documentation for debugging setup

### Database Management
- Use MongoDB Compass for database inspection
- Use Redis CLI for queue inspection: `redis-cli`
- Reset data: `docker-compose -f docker-compose-local.yml down -v`

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

## Production Considerations

When moving to production:
- Use production builds (`npm run build`)
- Set secure JWT secrets
- Configure proper domain URLs
- Set up SSL/TLS
- Configure firewalls and security
- Set up monitoring and logging
- Consider using the full `docker-compose.yml` for consistency