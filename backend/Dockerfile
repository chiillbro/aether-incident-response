# Use official Node.js LTS Alpine image as a parent image
FROM node:18-alpine AS development

# # Install build dependencies
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++
    # git \
    # openssh-client

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install
# RUN npm install --force

COPY . .

# Copy prisma schema
# COPY prisma ./prisma/

# Generate Prisma Client (optional here, can be done before start)
# RUN npx prisma generate

# Explicitly generate Prisma Client during the build
# RUN npx prisma generate

# Copy application source
# COPY . .

# Cleanup build dependencies (optional)
# RUN apk del .build-deps

# Add prisma client generation
RUN npx prisma generate
# RUN npx prisma migrate deploy

# Default command (will be overridden by docker-compose)
# CMD ["node", "dist/main"]
CMD ["npm", "run", "start:dev"]

# --- Production Build Stage (Example, we'll refine later) ---
# FROM node:18-alpine AS production
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --only=production
# COPY --from=development /app/dist ./dist
# COPY --from=development /app/node_modules ./node_modules # If needed
# COPY --from=development /app/prisma ./prisma
# CMD ["node", "dist/main"]