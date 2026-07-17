# MGrand Hub Shared Package

Shared utilities, middleware, and configurations for all MGrand Hub microservices.

## Installation

```bash
npm install
```

## Usage

```javascript
const {
  logger,
  database,
  redis,
  authenticate,
  authorize,
  errorHandler,
  validator,
  rateLimiter,
  ApiError,
  ApiResponse,
  asyncHandler,
  EventBus,
  ServiceClient,
} = require('@mgrand-hub/shared');
```

## Components

### Logger
Winston-based logger with structured logging:
```javascript
logger.info('User logged in', { userId: '123' });
logger.error('Database error', error);
logger.warn('Rate limit approaching');
logger.debug('Debug information');
```

### Database
MongoDB connection manager:
```javascript
await database.connect(process.env.MONGO_URI);
const status = database.getStatus();
const health = await database.healthCheck();
```

### Redis
Redis client with caching and pub/sub:
```javascript
await redis.connect();
await redis.set('key', value, ttl);
const data = await redis.get('key');
await redis.publish('event', data);
await redis.subscribe('event', callback);
```

### Authentication Middleware
```javascript
// Require authentication
app.get('/profile', authenticate, controller.getProfile);

// Require specific roles
app.delete('/user', authenticate, authorize('admin'), controller.deleteUser);

// Service-to-service auth
app.post('/internal', serviceAuth, controller.internalEndpoint);
```

### Error Handler
```javascript
const { errorHandler, notFound } = require('@mgrand-hub/shared');

// Use at the end of middleware chain
app.use(notFound);
app.use(errorHandler.errorHandler);
```

### Validator
```javascript
const { validate, commonSchemas, Joi } = require('@mgrand-hub/shared');

const schema = {
  body: Joi.object({
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
  }),
};

app.post('/register', validate(schema), controller.register);
```

### Rate Limiter
```javascript
const { defaultRateLimiter, authRateLimiter } = require('@mgrand-hub/shared');

// Default: 100 req/min per IP
app.use('/api', defaultRateLimiter);

// Auth endpoints: 5 req/15min
app.post('/login', authRateLimiter, controller.login);
```

### Event Bus
```javascript
const { EventBus } = require('@mgrand-hub/shared');

// Publish event
await EventBus.publish('user.registered', { userId, email });

// Subscribe to event
await EventBus.subscribe('user.registered', async (data) => {
  await sendWelcomeEmail(data.email);
});
```

### Service Client
```javascript
const { ServiceClient } = require('@mgrand-hub/shared');

const userService = new ServiceClient(
  process.env.USER_SERVICE_URL,
  'user-service'
);

const user = await userService.get(`/users/${userId}`);
```

## License

ISC
