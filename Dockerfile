FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build step (if any)
RUN npm run build

# Start the bot
CMD [ "node", "index.js" ]
