# dockerfile for development
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install TypeScript and nodemon globally
RUN npm install -g typescript ts-node nodemon

# Copy source files
COPY . .

# Expose backend port
EXPOSE 5000

# Start with hot reload using nodemon
CMD ["npm", "start"]
# CMD ["node", "build/App.js"] this is will be for production
