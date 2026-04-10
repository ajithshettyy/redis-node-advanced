FROM redis:7-alpine

# Expose Redis port
EXPOSE 6379

# Set working directory
WORKDIR /data

# Run Redis server
CMD ["redis-server", "--appendonly", "yes"]
