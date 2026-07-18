FROM node:18-alpine

# Install Python and TTS/STT dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg

# Install edge-tts and whisper
RUN pip3 install --no-cache-dir edge-tts openai-whisper

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/audio uploads/images

# Expose port
EXPOSE 3013

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3013/api/education/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
CMD ["node", "src/index.js"]
