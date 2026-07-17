# SuperApp MGrand Hub - Architecture Documentation

## 🏗️ System Architecture

### Architecture Style: Microservices with Shared Database

We use a **microservices architecture with a shared database** pattern. This provides:
- ✅ Service independence for deployment and scaling
- ✅ Simplified data consistency (no distributed transactions)
- ✅ Easier development and testing
- ✅ Lower operational complexity
- ✅ Gradual migration path to separate databases

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet/Clients                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Load Balancer       │
                    │   SSL Termination     │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   API Gateway (Kong)  │
                    │   - Routing           │
                    │   - Rate Limiting     │
                    │   - Authentication    │
                    │   - Load Balancing    │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼─────────────────────┐
        │                       │                     │
   ┌────▼─────┐         ┌──────-▼──────┐        ┌──────▼──────┐
   │  Auth    │         │  Ecommerce   │        │  Payment    │
   │ Service  │         │   Service    │        │  Service    │
   │  :3001   │         │   :3003      │        │   :3004     │
   └────┬─────┘         └──────┬──────-┘        └──────┬──────┘
        │                      │                      │
        │     ┌────────────────┼──────────────┐       │
        │     │                │              │       │
   ┌────▼─────▼──┐     ┌──────▼──────┐  ┌───▼───────▼────┐
   │ Classifieds │     │    Food     │  │  Notification  │
   │   Service   │     │  Delivery   │  │    Service     │
   │   :3005     │     │  Service    │  │    :3012       │
   └────┬────────┘     │   :3006     │  └───┬────────────┘
        │              └──────┬──────┘      │
        └──────────────┬──────┴────┬────────┘
                       │           │
                ┌──────▼───────────▼──────┐
                │    Message Queue        │
                │    (Redis Pub/Sub)      │
                └──────┬──────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
   │ MongoDB  │  │  Redis   │  │  MinIO   │
   │ Database │  │  Cache   │  │  Storage │
   └──────────┘  └──────────┘  └──────────┘
```

## 🎯 Core Design Principles

### 1. Service Independence
- Each service can be deployed independently
- Services communicate via HTTP REST APIs
- Async communication via message queue (Redis Pub/Sub)

### 2. Shared Infrastructure
- Single MongoDB database (simplifies transactions)
- Shared Redis for caching and sessions
- Shared logging and monitoring

### 3. API-First Design
- All services expose RESTful APIs
- OpenAPI/Swagger documentation
- Versioned APIs (v1, v2)

### 4. Security by Default
- JWT authentication on all protected endpoints
- Rate limiting to prevent abuse
- Input validation and sanitization
- HTTPS everywhere

### 5. Observability
- Structured logging (Winston)
- Metrics collection (Prometheus)
- Distributed tracing (optional: Jaeger)
- Health checks on all services

## 📦 Service Catalog

### Core Services (Must-have)

#### 1. Auth Service (Port 3001)
**Responsibility**: Authentication and authorization
- User registration (email/phone)
- Login (email/phone + password)
- JWT token generation and validation
- OTP generation and verification
- Password reset
- Session management

**Database Collections**:
- `users` - User credentials and basic info
- `sessions` - Active sessions
- `otps` - One-time passwords
- `refresh_tokens` - Refresh tokens

**Dependencies**: Redis (for session storage)

---

#### 2. User Service (Port 3002)
**Responsibility**: User profile management
- User profile CRUD
- Avatar upload and management
- User preferences
- User settings
- Address management
- Wishlist management

**Database Collections**:
- `user_profiles` - Detailed user information
- `addresses` - User addresses
- `wishlists` - User wishlists

**Dependencies**: Auth Service, File Service

---

#### 3. Payment Service (Port 3004)
**Responsibility**: Payment processing
- Payment gateway integration (Razorpay, Stripe)
- Payment creation
- Payment verification
- Refund processing
- Transaction history
- Invoice generation

**Database Collections**:
- `transactions` - Payment transactions
- `invoices` - Generated invoices
- `refunds` - Refund records

**Dependencies**: Notification Service

**External APIs**: Razorpay, Stripe

---

#### 4. Notification Service (Port 3012)
**Responsibility**: Multi-channel notifications
- Email notifications (SendGrid/AWS SES)
- SMS notifications (Twilio)
- Push notifications (Firebase)
- In-app notifications
- Notification templates
- Notification history

**Database Collections**:
- `notifications` - Notification records
- `notification_templates` - Email/SMS templates
- `notification_preferences` - User preferences

**Dependencies**: None (called by all services)

**External APIs**: SendGrid, Twilio, Firebase

---

### Business Services

#### 5. Ecommerce Service (Port 3003)
**Responsibility**: Product catalog and orders
- Product catalog management
- Category management
- Shopping cart
- Order creation and management
- Order tracking
- Product reviews and ratings
- Inventory management

**Database Collections**:
- `products` - Product catalog
- `categories` - Product categories
- `carts` - Shopping carts
- `orders` - Customer orders
- `order_items` - Order line items
- `reviews` - Product reviews

**Dependencies**: Payment Service, Notification Service, User Service

---

#### 6. Classifieds Service (Port 3005)
**Responsibility**: Classified listings
- Listing creation and management
- Category management
- Search and filtering
- Featured listings
- Listing moderation
- User inquiries

**Database Collections**:
- `classifieds` - Classified listings
- `classified_categories` - Categories
- `classified_inquiries` - User inquiries
- `featured_listings` - Featured ads

**Dependencies**: User Service, Payment Service, Notification Service

---

#### 7. Food Delivery Service (Port 3006)
**Responsibility**: Restaurant and food ordering
- Restaurant management
- Menu management
- Food order creation
- Order tracking
- Delivery management
- Restaurant ratings

**Database Collections**:
- `restaurants` - Restaurant information
- `menus` - Restaurant menus
- `menu_items` - Menu items
- `food_orders` - Customer orders
- `deliveries` - Delivery tracking

**Dependencies**: Payment Service, Notification Service, User Service

---

#### 8. Marketplace Service (Port 3007)
**Responsibility**: Multiple marketplace verticals
- Real estate listings
- Matrimonial profiles
- Healthcare providers
- Education courses
- Tourism packages
- Hotel bookings

**Database Collections**:
- `real_estate` - Property listings
- `matrimonial` - Matrimonial profiles
- `healthcare_providers` - Healthcare listings
- `education_courses` - Educational courses
- `tourism_packages` - Tourism packages
- `hotels` - Hotel listings

**Dependencies**: User Service, Payment Service, Notification Service

---

#### 9. Business Service (Port 3008)
**Responsibility**: Business tools
- Business builder
- Freelancer marketplace
- Service provider listings
- Gulf services
- Business services booking

**Database Collections**:
- `businesses` - Business profiles
- `freelancers` - Freelancer profiles
- `service_providers` - Service providers
- `bookings` - Service bookings
- `projects` - Freelancer projects

**Dependencies**: User Service, Payment Service, Notification Service

---

#### 10. Content Service (Port 3009)
**Responsibility**: User-generated content
- Messaging system
- Personal diary
- Social feed/posts
- Comments and likes
- Media management
- Content moderation

**Database Collections**:
- `messages` - User messages
- `diary_entries` - Personal diary
- `posts` - Social posts
- `comments` - Post comments
- `likes` - Post/comment likes
- `media` - Media files

**Dependencies**: User Service, Notification Service

---

#### 11. AI Service (Port 3010)
**Responsibility**: AI-powered features
- AI chat assistant
- Beauty AI recommendations
- Astrology predictions
- Kids video generation
- Image processing
- Natural language processing

**Database Collections**:
- `chat_conversations` - Chat history
- `beauty_profiles` - User beauty profiles
- `astrology_charts` - Birth charts
- `ai_generations` - Generated content

**Dependencies**: User Service

**External APIs**: OpenAI, Google AI, Custom ML models

---

#### 12. Finance Service (Port 3011)
**Responsibility**: Financial services
- Financial institution listings
- Loan applications
- Loan tracking
- Credit score management
- EMI calculators

**Database Collections**:
- `financial_institutions` - Banks, NBFCs
- `loan_applications` - Loan requests
- `loans` - Active loans
- `emi_schedules` - Payment schedules

**Dependencies**: User Service, Payment Service, Notification Service

---

## 🔄 Communication Patterns

### 1. Synchronous Communication (HTTP REST)
Used for: Real-time operations requiring immediate response

```
Service A → HTTP Request → Service B → HTTP Response → Service A
```

**Example**: Auth Service verifying user → User Service gets profile

### 2. Asynchronous Communication (Message Queue)
Used for: Non-blocking operations, event notifications

```
Service A → Publish Event → Redis Pub/Sub → Subscribers → Process Event
```

**Example**: Order created → Payment Service, Notification Service, Inventory Service

### 3. Event-Driven Architecture

**Events Published**:
- `user.registered` - New user registration
- `user.login` - User login
- `order.created` - New order
- `order.paid` - Order payment successful
- `order.shipped` - Order shipped
- `payment.success` - Payment successful
- `payment.failed` - Payment failed
- `listing.created` - New listing created
- `message.received` - New message

**Event Subscribers**:
- Notification Service (subscribes to all events for notifications)
- Analytics Service (subscribes to all events for analytics)
- Audit Service (subscribes to critical events for auditing)

## 🗄️ Database Design

### Shared Database Strategy

**Benefits**:
- ✅ No distributed transactions
- ✅ ACID guarantees
- ✅ Simpler development
- ✅ Easier queries across entities

**Collection Ownership**:
Each service owns specific collections:

```
auth-service:
  - users
  - sessions
  - otps
  - refresh_tokens

ecommerce-service:
  - products
  - categories
  - carts
  - orders
  - order_items

payment-service:
  - transactions
  - invoices
  - refunds

... etc
```

**Rules**:
1. Services can only write to their own collections
2. Services can read from other collections (but prefer API calls)
3. Use indexes properly for performance
4. Use soft deletes (deletedAt field)

## 🔐 Security Architecture

### Authentication Flow

```
1. User → Login Request → API Gateway → Auth Service
2. Auth Service validates credentials
3. Auth Service generates JWT (Access + Refresh token)
4. Auth Service returns tokens to user
5. User stores tokens (localStorage/cookie)
6. User includes Access Token in Authorization header
7. API Gateway validates token (or delegates to Auth Service)
8. Request forwarded to target service
9. Service processes request
10. Response returned to user
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "60d5ec49f1b2c8b1f8e4c1a1",
    "email": "user@example.com",
    "role": "user",
    "iat": 1625147200,
    "exp": 1625751200
  }
}
```

### Authorization Levels
- **Public**: No authentication required
- **Authenticated**: Valid JWT token required
- **Admin**: Admin role required
- **Service-to-Service**: Service API key required

## 📊 Data Flow Examples

### Example 1: User Registration

```
1. User submits registration form
2. Frontend → API Gateway → Auth Service
3. Auth Service:
   - Validates input
   - Checks if user exists
   - Hashes password
   - Creates user in database
   - Generates OTP
4. Auth Service → Notification Service (send OTP email)
5. Auth Service → Response (success, userId)
6. User receives OTP email
7. User submits OTP
8. Auth Service validates OTP
9. Auth Service generates JWT tokens
10. User logged in
```

### Example 2: Create Order

```
1. User adds items to cart
2. User proceeds to checkout
3. Frontend → API Gateway → Ecommerce Service
4. Ecommerce Service:
   - Validates cart
   - Checks inventory
   - Creates order (status: pending)
   - Calculates total
5. Ecommerce Service → Payment Service (create payment)
6. Payment Service:
   - Creates Razorpay order
   - Returns payment details
7. User completes payment on Razorpay
8. Razorpay webhook → Payment Service
9. Payment Service:
   - Verifies payment signature
   - Updates transaction status
   - Publishes 'order.paid' event
10. Ecommerce Service (event subscriber):
    - Updates order status to 'confirmed'
    - Reduces inventory
11. Notification Service (event subscriber):
    - Sends order confirmation email
    - Sends SMS to user
12. User receives confirmation
```

## 🚀 Deployment Architecture

### Cloud Run Deployment

```
┌─────────────────────────────────────────┐
│         Google Cloud Platform           │
│                                         │
│  ┌────────────────────────────────┐    │
│  │     Cloud Load Balancer         │    │
│  └────────────┬───────────────────┘    │
│               │                         │
│  ┌────────────▼───────────────────┐    │
│  │      Cloud Run Services         │    │
│  │                                 │    │
│  │  ┌─────────┐  ┌─────────┐     │    │
│  │  │  Auth   │  │Ecommerce│     │    │
│  │  └─────────┘  └─────────┘     │    │
│  │                                 │    │
│  │  ┌─────────┐  ┌─────────┐     │    │
│  │  │ Payment │  │  Food   │     │    │
│  │  └─────────┘  └─────────┘     │    │
│  └─────────────────────────────── │    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │     MongoDB Atlas (External)    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │     Redis Cloud (External)      │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Docker Compose (Local/Staging)

```yaml
services:
  mongodb:
    image: mongo:7
    ports: [27017:27017]

  redis:
    image: redis:7-alpine
    ports: [6379:6379]

  auth-service:
    build: ./services/auth-service
    ports: [3001:3001]
    depends_on: [mongodb, redis]

  payment-service:
    build: ./services/payment-service
    ports: [3004:3004]
    depends_on: [mongodb, redis]

  # ... other services
```

## 📈 Scalability Strategy

### Horizontal Scaling
- Each service can scale independently
- Auto-scaling based on CPU/Memory/Request count
- Min instances: 0 (scale to zero for cost savings)
- Max instances: 10 per service

### Caching Strategy
- Redis for session caching
- Redis for frequently accessed data
- CDN for static assets
- Browser caching for API responses (where appropriate)

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization
- Read replicas for read-heavy operations

## 🔍 Monitoring & Observability

### Metrics (Prometheus)
- Request rate
- Response time (p50, p95, p99)
- Error rate
- CPU/Memory usage
- Database query time
- Cache hit rate

### Logging (Winston + Loki)
- Structured JSON logs
- Log levels: error, warn, info, debug
- Correlation IDs for request tracking
- Log aggregation in Loki

### Health Checks
Each service exposes:
- `/health` - Basic health check
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

## 🔄 Migration Path

### Phase 1: Current State (Shared Database)
- All services use single MongoDB
- Simple and fast to develop
- Easy data consistency

### Phase 2: Database per Service (Future)
When needed (100K+ users, multiple teams):
- Extract critical services to separate databases
- Start with Payment service (PCI compliance)
- Use Saga pattern for distributed transactions
- Implement event sourcing where needed

---

**This architecture provides a solid foundation that can grow with your business!**
