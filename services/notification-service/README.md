# Notification Service

Multi-channel notification microservice supporting Email, SMS, and Push notifications.

## Features

- Email notifications (SMTP/Nodemailer)
- SMS notifications (Twilio)
- Push notifications (Firebase)
- Template management
- Event-driven notifications
- Notification history
- Read receipts

## API Endpoints

### Send Notifications

**POST /api/notifications/email**
```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "content": "<h1>Welcome to MGrand Hub</h1>"
}
```

**POST /api/notifications/sms**
```json
{
  "to": "+1234567890",
  "content": "Your OTP is 123456"
}
```

**POST /api/notifications/push**
```json
{
  "token": "device_token",
  "title": "New Message",
  "body": "You have a new message"
}
```

### Manage Notifications

**GET /api/notifications/list** - Get user notifications
**PATCH /api/notifications/:id/read** - Mark as read

### Templates (Admin)

**POST /api/notifications/templates** - Create template
**GET /api/notifications/templates** - List templates

## Event Subscriptions

Automatically sends notifications for:
- `user.registered` - Welcome email
- `payment.completed` - Payment confirmation
- `order.created` - Order confirmation

## Environment Variables

See `.env.example` for configuration.

## License

ISC
