# Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-alpine AS builder

# Set labels
LABEL maintainer="peterweb3"
LABEL app="gmgn-clone-frontend"

WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application (VITE_API_URL will be baked into the build)
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Set labels
LABEL maintainer="peterweb3"
LABEL app="gmgn-clone-frontend"

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
