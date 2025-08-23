# Multi-stage build for production
FROM node:18-alpine AS backend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=frontend-build /app/client/build ./client/build
COPY . .
EXPOSE 5000
CMD ["npm", "start"]