FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create upload directories
RUN mkdir -p uploads/messaging/files \
    uploads/messaging/images \
    uploads/messaging/videos \
    uploads/messaging/audio

# Expose port
EXPOSE 3007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3007/api/messaging/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start app
CMD ["npm", "start"]
