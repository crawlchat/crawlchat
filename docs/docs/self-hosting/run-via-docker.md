---
sidebar_position: 1
---

# Run via Docker

### ⚠️ Important Notice

**This self-hosting guide is NOT production-ready.** The self-hosted version is provided as-is for development, testing, and evaluation purposes. For production use, we strongly recommend using the managed cloud service at [https://crawlchat.app/](https://crawlchat.app/).

**Support is not guaranteed for self-hosting users.** If you encounter issues while self-hosting, you may need to troubleshoot independently or use the production cloud service.

### Prerequisites

Before you begin, ensure you have:

1. **Docker** and **Docker Compose** installed on your system
2. **External API Keys**:
   - Pinecone API key ([Get one here](https://www.pinecone.io))
   - OpenRouter API key ([Get one here](https://openrouter.ai))
3. **Domain/Network Configuration**:
   - A domain name or IP address where services will be accessible (if not using localhost)
   - Proper network configuration for services to communicate
4. **Optional Services** (for full functionality):
   - Discord bot credentials (if using Discord integration)
   - Slack app credentials (if using Slack integration)
   - Resend API key (for email functionality)
   - Google OAuth credentials (for Google sign-in)
   - GitHub token (for GitHub source syncing)
   - ScrapeCreators API key (for web scraping features)

### Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/crawlchat/crawlchat.git
   cd crawlchat
   ```

2. **Create a docker-compose override file** (optional, for custom configuration):
   ```bash
   cp docker-compose.yml docker-compose.override.yml
   ```

3. **Edit environment variables** in `docker-compose.yml`:
   - Replace `<PINECONE_API_KEY>` with your Pinecone API key
   - Replace `<OPENROUTER_API_KEY>` with your OpenRouter API key
   - Update `JWT_SECRET` with a strong, random secret (use the same value for all services)
   - Update URLs if not using localhost (see Environment Variables section)

4. **Start the services**:
   ```bash
   docker-compose up -d
   ```

5. **Wait for initialization**: The `mongo-init` service will automatically configure MongoDB replica set. This may take a minute or two.

6. **Access the application**:
   - Frontend: http://localhost:3001
   - Server API: http://localhost:3002
   - Source Sync API: http://localhost:3003
   - Slack App (if configured): http://localhost:3004

### Environment Variables

#### Common Variables (All Services)

These variables should be set consistently across all services:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SELF_HOSTED` | Yes | Must be set to `"true"` for self-hosted deployments | `"true"` |
| `DATABASE_URL` | Yes | MongoDB connection string with replica set | `"mongodb://database:27017/crawlchat?replicaSet=rs0"` |
| `JWT_SECRET` | Yes | Secret key for JWT token signing. **Must be the same across all services** | `"a-long-random-secret-string"` |

### Network Configuration

All services run on a Docker bridge network named `crawlchat-net`. Services communicate using their service names as hostnames:

- `database` - MongoDB service
- `redis` - Redis service
- `source_sync` - Source sync service (internal name)

### Troubleshooting

#### MongoDB Replica Set Not Initializing

If MongoDB fails to initialize the replica set:

1. Check the `mongo-init` service logs:
   ```bash
   docker-compose logs mongo-init
   ```

2. Ensure the database service is healthy before mongo-init runs

3. Manually initialize if needed:
   ```bash
   docker-compose exec database mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"database:27017"}]})'
   ```

#### Services Can't Connect to Database

- Verify all services use the same `DATABASE_URL` format: `mongodb://database:27017/crawlchat?replicaSet=rs0`
- Ensure services are on the same Docker network (`crawlchat-net`)
- Check that the database service is running and healthy

#### Services Can't Connect to Redis

- Verify `REDIS_URL` is set to `redis://redis:6379` in source-sync service
- Ensure source-sync service depends on redis in docker-compose.yml
- Check redis service health

#### Port Conflicts

If ports 3001-3004 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3005:3000"  # Change external port
```

Remember to update corresponding environment variables (e.g., `VITE_APP_URL`) to match.

#### JWT Secret Mismatch

All services must use the **exact same** `JWT_SECRET` value. If authentication fails between services, verify all services have identical `JWT_SECRET` values.