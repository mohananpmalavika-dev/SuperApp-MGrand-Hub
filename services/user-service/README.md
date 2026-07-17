# User Service

User profile management microservice for MGrand Hub.

## Features

- User profile management
- Address management
- User preferences
- Avatar upload
- Profile completion tracking
- User search (admin)

## API Endpoints

**GET /api/users/profile** - Get user profile
**PUT /api/users/profile** - Update profile
**POST /api/users/addresses** - Add address
**PUT /api/users/addresses/:id** - Update address
**DELETE /api/users/addresses/:id** - Delete address
**PUT /api/users/preferences** - Update preferences
**POST /api/users/avatar** - Upload avatar
**GET /api/users/search** - Search users (admin)

## Example Usage

```bash
# Get profile
curl http://localhost:3002/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:3002/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe"}'

# Add address
curl -X POST http://localhost:3002/api/users/addresses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"addressLine1":"123 Main St","city":"Mumbai","state":"Maharashtra","country":"India","pincode":"400001"}'
```

## License

ISC
