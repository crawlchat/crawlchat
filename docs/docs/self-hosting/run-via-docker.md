---
sidebar_position: 3
---

# Run via Docker

**This self-hosting guide is NOT production-ready.** The self-hosted version is provided as-is for development, testing, and evaluation purposes. For production use, we strongly recommend using the managed cloud service at [https://crawlchat.app/](https://crawlchat.app/).

**Support is not guaranteed for self-hosting users.** If you encounter issues while self-hosting, you may need to troubleshoot independently or use the production cloud service.

Make sure you meet the [prerequisites](./prerequisites.md) before starting it.

### 1. Copy `docker-compose.yml` file

Better you copy the `compose` file and do the required modifications.

```bash
cp docker/docker-compose.yml docker/docker-compose.override.yml
```

### 2. Set `env`

- Replace `<OPENROUTER_API_KEY>` with your OpenRouter API key
- Update `JWT_SECRET` with a strong, random secret (use the same value for all services)
- Add GitHub app credentials if using GitHub integration (optional)
- Update URLs if not using localhost (see Environment Variables section)

### 3. Start

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### 4. Access

- UI: http://localhost:3001
- Server API: http://localhost:3002
- Source Sync API: http://localhost:3003
- Slack App (if configured): http://localhost:3004

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
  - "3005:3000" # Change external port
```

Remember to update corresponding environment variables (e.g., `VITE_APP_URL`) to match.

#### JWT Secret Mismatch

All services must use the **exact same** `JWT_SECRET` value. If authentication fails between services, verify all services have identical `JWT_SECRET` values.
