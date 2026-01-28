---
sidebar_position: 2
---

# Run Locally

This guide covers running CrawlChat services locally for development and testing purposes. It is a `monorepo` and uses [Turborepo](https://turborepo.dev) for the build process. You can follow the instructions below to quickly launch the services so that you can customise and contribute.

Make sure you meet the [prerequisites](./prerequisites.md) before starting it.

### 1. Install dependencies

```bash
npm i
```

### 2. Database and Redis

```bash
docker-compose -f docker/docker-compose-local.yml up -d
```

This will start:

- **MongoDB** on `localhost:27017` with replica set `rs0` initialized
- **Redis** on `localhost:6379` with AOF persistence enabled
- **mongo-init** service that automatically initializes the replica set

### 2. Setup `.env`

Copy the `.env.example` from the root to `.env`, and fill them out to your needs:

```bash
`cp .env.example .env`
```

### 3. Start Services

You can start all the services in `dev` mode using following command from the root:

```bash
npm run dev
```

### 4. Testing the Setup

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
- Check Docker containers: `docker-compose -f docker/docker-compose-local.yml ps`
- View logs: `docker-compose -f docker/docker-compose-local.yml logs database`

#### Redis Connection Issues

- Ensure Redis is running and healthy
- Check REDIS_URL configuration: `redis://localhost:6379`
- Check Docker containers: `docker-compose -f docker/docker-compose-local.yml ps`
- View logs: `docker-compose -f docker/docker-compose-local.yml logs redis`

#### API Key Issues

- Verify all required API keys are set
- Check key formats and permissions
- Test API keys independently

### Stopping Services

To stop the database and Redis services:

```bash
docker-compose -f docker/docker-compose-local.yml down
```

To stop and remove volumes (reset all data):

```bash
docker-compose -f docker/docker-compose-local.yml down -v
```
