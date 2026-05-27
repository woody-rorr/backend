# syntax=docker/dockerfile:1

# ---- builder stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# native addon build deps (bcrypt 등)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# ECS task-def healthCheck: `curl -fsS http://localhost:5013/health`
# node:20-alpine 에는 curl 이 없어 health check 가 실패하므로 설치한다.
RUN apk add --no-cache curl ca-certificates

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY deploy/entrypoint.sh ./deploy/entrypoint.sh
RUN chmod +x ./deploy/entrypoint.sh

EXPOSE 5013
ENTRYPOINT ["./deploy/entrypoint.sh"]
