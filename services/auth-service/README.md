# Auth Service

Authentication and authorization microservice for MGrand Hub.

## Features

- User registration with email/phone
- Login with JWT tokens
- OTP generation and verification
- Password reset flow
- Token refresh mechanism
- Session management
- Role-based access control

## API Endpoints

### Public Endpoints

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "phone": "1234567890"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**POST /api/auth/refresh-token**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**POST /api/auth/send-otp**
```json
{
  "identifier": "user@example.com",
  "type": "email_verification"
}
```

**POST /api/auth/verify-otp**
```json
{
  "identifier": "user@example.com",
  "otp": "123456",
  "type": "email_verification"
}
```

### Protected Endpoints

**GET /api/auth/profile**
Headers: `Authorization: Bearer <token>`

**POST /api/auth/logout**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**POST /api/auth/change-password**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

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
docker build -t auth-service .
docker run -p 3001:3001 --env-file .env auth-service
```

## Environment Variables

See `.env.example` for required variables.

## License

ISC
