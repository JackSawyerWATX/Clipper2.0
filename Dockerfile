# Dockerfile for Clipper 2.0 - Optional containerized deployment
# This is an alternative to the manual setup. Use with: docker build -t clipper:latest .

FROM node:18-alpine

# Install basic utilities
RUN apk add --no-cache curl nano

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy application code
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 5000 3000

# Start both backend and frontend
CMD ["sh", "-c", "cd server && npm start & cd .. && npm run preview"]
