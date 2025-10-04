FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Start the bot
CMD ["npm", "start"]
