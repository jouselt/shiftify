# Stage 1: Build the Angular application
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the compiled files from the builder stage
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf # <-- Make sure this line is present and uncommented

EXPOSE 80