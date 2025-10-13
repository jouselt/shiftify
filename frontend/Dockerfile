# Stage 1: Build the application
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json /app/
COPY node_modules/ /app/node_modules/

RUN npm i -g @angular/cli

RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the compiled static files from the builder stage
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
# Copy a custom nginx config if needed for routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80