# Use Node.js official image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Serve the app using a simple server
RUN npm install -g serve

# Expose frontend port
EXPOSE 3000

# Start server
CMD ["serve", "-s", "dist", "-l", "3000"]
