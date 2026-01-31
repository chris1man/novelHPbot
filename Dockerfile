FROM node:20-slim

# Create app directory
WORKDIR /app

# Set default port
ENV PORT=3000

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build step (not required but kept for compatibility)
RUN npm run build

# Expose port so Timeweb knows where to proxy
EXPOSE 3000

# Start the bot
CMD [ "node", "index.js" ]
