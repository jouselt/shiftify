# Stage 1: Build the application
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
# Don't forget to copy assets!
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/src/i18n ./src/i18n

EXPOSE 3000
CMD ["node", "dist/main"]