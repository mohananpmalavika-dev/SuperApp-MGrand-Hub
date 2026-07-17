# Payment Service

Payment processing microservice for MGrand Hub with Razorpay and Stripe integration.

## Features

- Payment order creation
- Payment verification with signature validation
- Transaction management
- Refund processing
- Invoice generation
- Webhook handling
- Payment statistics
- Multi-gateway support (Razorpay, Stripe)

## API Endpoints

### Protected Endpoints

**POST /api/payments/orders**
Create a new payment order
```json
{
  "amount": 1000,
  "currency": "INR",
  "orderId": "ORDER-123",
  "metadata": {
    "productId": "PROD-456"
  }
}
```

**POST /api/payments/verify**
Verify payment after completion
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

**GET /api/payments/transactions/:id**
Get transaction details

**GET /api/payments/transactions**
Get user transactions with pagination
Query params: `status`, `page`, `limit`

**POST /api/payments/refunds/:id** (Admin only)
Process refund
```json
{
  "amount": 500,
  "reason": "Product returned"
}
```

**GET /api/payments/statistics**
Get user payment statistics

### Public Endpoints

**POST /api/payments/webhook**
Razorpay webhook handler (internal use)

## Environment Variables

See `.env.example` for required variables.

Key variables:
- `RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay key secret
- `RAZORPAY_WEBHOOK_SECRET` - Webhook signature secret

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Docker

```bash
docker build -t payment-service .
docker run -p 3004:3004 --env-file .env payment-service
```

## Testing Payment Flow

### 1. Create Order
```bash
curl -X POST http://localhost:3004/api/payments/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"currency":"INR","orderId":"TEST-001"}'
```

### 2. Verify Payment (after user pays on Razorpay)
```bash
curl -X POST http://localhost:3004/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id":"order_xxx",
    "razorpay_payment_id":"pay_xxx",
    "razorpay_signature":"signature_xxx"
  }'
```

### 3. Get Transactions
```bash
curl http://localhost:3004/api/payments/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Razorpay Setup

1. Sign up at https://razorpay.com
2. Get API keys from Dashboard > Settings > API Keys
3. Add keys to `.env` file
4. Configure webhook URL in Razorpay dashboard
5. Add webhook secret to `.env`

## Events Published

The service publishes these events:

- `payment.order.created` - When order is created
- `payment.completed` - When payment is successful
- `payment.failed` - When payment fails
- `payment.refunded` - When refund is processed

## License

ISC
