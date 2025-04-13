# Use official Node.js LTS Alpine image
FROM node:18-alpine AS development


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port 3000 for Next.js dev server
EXPOSE 3000

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]

# --- Production Build Stage (Example, we'll refine later) ---
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM node:18-alpine AS production
# WORKDIR /app
# ENV NODE_ENV production
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# EXPOSE 3000
# CMD ["node", "server.js"] # Requires output: 'standalone' in next.config.js