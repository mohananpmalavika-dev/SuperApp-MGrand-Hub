# API Gateway

Nginx-based API Gateway for MGrand Hub microservices.

## Features

- **Request Routing** - Routes requests to appropriate microservices
- **Rate Limiting** - Prevents abuse with configurable limits
- **Load Balancing** - Distributes traffic across service instances
- **CORS Handling** - Configured CORS headers for web clients
- **Security Headers** - Adds security headers to all responses
- **Health Checks** - Gateway health endpoint at `/health`

## Configuration

### Nginx Configuration Files

- `nginx.conf` - Main Nginx configuration
- `conf.d/default.conf` - API routing configuration

### Rate Limits

- General endpoints: 100 requests/minute per IP
- Auth endpoints: 5 requests/minute per IP (login, register)
- Burst: 10-20 requests allowed beyond limit

### Routing Rules

```
/api/auth/*          → auth-service:3001
/api/users/*         → user-service:3002
/api/products/*      → ecommerce-service:3003
/api/cart/*          → ecommerce-service:3003
/api/orders/*        → ecommerce-service:3003
/api/payments/*      → payment-service:3004
/api/classifieds/*   → classifieds-service:3005
/api/restaurants/*   → food-delivery-service:3006
/api/menus/*         → food-delivery-service:3006
/api/food-orders/*   → food-delivery-service:3006
```

## Usage

### Docker Compose

The gateway is included in the main docker-compose.yml:

```bash
docker-compose up nginx
```

Access the gateway at: http://localhost:8080

### Standalone

```bash
cd gateway
docker build -t mgrand-gateway .
docker run -p 8080:80 --name mgrand-gateway mgrand-gateway
```

### Testing

```bash
# Health check
curl http://localhost:8080/health

# Auth endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Products endpoint
curl http://localhost:8080/api/products
```

## Monitoring

View Nginx logs:

```bash
docker-compose logs -f nginx
```

## Production Considerations

### SSL/TLS

Add SSL configuration for HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... rest of configuration
}
```

### Load Balancing

Add multiple service instances:

```nginx
upstream auth-service {
    least_conn;
    server auth-service-1:3001;
    server auth-service-2:3001;
    server auth-service-3:3001;
}
```

### Caching

Add caching for GET requests:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api/products {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    # ... rest of configuration
}
```

## License

ISC
