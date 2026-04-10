# Docker Setup for Redis

This project includes Docker configuration to run Redis in a containerized environment.

## Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (comes with Docker Desktop)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start Redis server
docker compose up -d

# View logs
docker compose logs -f redis

# Stop Redis
docker compose down

# Remove data volume
docker compose down -v
```

### Option 2: Using Docker Directly

```bash
# Build the image
docker build -t redis-learning .

# Run the container
docker run -d -p 6379:6379 --name redis-server redis-learning

# View logs
docker logs -f redis-server

# Stop the container
docker stop redis-server

# Remove the container
docker rm redis-server
```

## Verify Redis is Running

```bash
# Check if Redis is responding
redis-cli ping
# Should return: PONG

# Connect to Redis CLI
redis-cli

# Inside redis-cli:
> ping
PONG
> SET key "Hello"
OK
> GET key
"Hello"
```

## Running Examples with Docker Redis

Once Redis is running via Docker:

```bash
# Install dependencies
npm install

# Run examples
npm run basics
npm run caching
npm run sessions
# ... etc
```

## Dockerfile Details

The Dockerfile:
- Uses `redis:7-alpine` (lightweight Redis 7 image)
- Exposes port 6379
- Enables AOF (Append-Only File) persistence
- Sets working directory to `/data`

## docker-compose.yml Details

The docker-compose configuration:
- Builds Redis from Dockerfile
- Maps port 6379 locally
- Persists data in `redis-data` volume
- Includes health checks (pings Redis every 5 seconds)
- Automatically restarts on failure

## Data Persistence

Redis data is stored in a Docker volume named `redis-data`. This means:
- Data persists even if container stops
- Data is lost only if volume is deleted

To clean up data:
```bash
docker compose down -v
```

## Environment Configuration

To change Redis configuration, edit `docker-compose.yml` and add environment variables to the `redis` service.

Example - Add password:
```yaml
services:
  redis:
    # ... other config
    environment:
      - REDIS_PASSWORD=mypassword
```

## Troubleshooting

### Port 6379 already in use

```bash
# Find process using port
lsof -i :6379

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "6380:6379"  # Host:Container
```

### Connection refused

```bash
# Check if container is running
docker ps

# Check container logs
docker compose logs redis

# Restart container
docker compose restart redis

# Wait for health check
docker compose ps redis
```

### Permission denied errors

```bash
# On Linux, you may need sudo
sudo docker compose up -d
```

## Advanced Usage

### Custom Redis Configuration

Create a `redis.conf` file and mount it:

```yaml
services:
  redis:
    volumes:
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
```

### Network Communication

To connect from another service:

```yaml
services:
  app:
    depends_on:
      - redis
    networks:
      - redis-network

  redis:
    networks:
      - redis-network

networks:
  redis-network:
```

## Performance Tips

- Use Alpine Linux image for smaller size
- Enable persistence (AOF) for data safety
- Use health checks to ensure Redis is ready
- Volume mounting for persistent storage

## Cleanup

```bash
# Stop and remove all containers
docker compose down

# Remove everything including volumes
docker compose down -v

# Remove unused images
docker image prune

# Remove all Redis containers (careful!)
docker rm -f $(docker ps -a | grep redis | awk '{print $1}')
```

---

**Ready to use Redis in Docker? Run `docker compose up -d`! 🐳**
