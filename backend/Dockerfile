# ---- Base ----
FROM node:18-alpine AS base
WORKDIR /app
# Install base deps needed at runtime
# Needed by Prisma sometimes
RUN apk add --no-cache openssl

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
# Install build-time deps only needed for 'npm install' or 'rebuild'
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
# Run rebuilds or patches if necessary after npm ci
# Example if bcrypt needs rebuilding
RUN npm rebuild bcrypt --build-from-source

# ---- Builder ----
FROM base AS builder
WORKDIR /app

# --- CHANGE: Copy source code FIRST ---
COPY . .
# Copy only necessary files from previous stages
# --- CHANGE: THEN copy node_modules ---
COPY --from=deps /app/node_modules ./node_modules
# Generate Prisma Client (needs schema from COPY .)
# Ensure prisma directory exists before generate (it should from COPY .)
# DEBUG: Check if prisma dir exists
RUN ls -la /app/prisma
# Generate Prisma Client (needs schema)
RUN npx prisma generate
# Build the application
RUN npm run build
# Remove development dependencies after build
RUN npm prune --omit=dev
# --- ADDED: Explicitly check prisma dir exists BEFORE final stage ---
RUN echo "Checking /app/prisma before production stage:" && ls -la /app/prisma


# ---- Production ----
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
# Copy built assets and production node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copy prisma schema for runtime migrations if needed
# --- CHANGE: Copy prisma directory - This should now work if the builder stage is correct ---
COPY --from=builder /app/prisma ./prisma


# --- DEBUG STEP ---
RUN echo "--- Listing /app contents in production stage ---" && ls -la /app
RUN echo "--- Listing /app/dist contents in production stage ---" && ls -la /app/dist

RUN echo "--- Listing /app/dist/src contents in production stage ---" && ls -la /app/dist/src 
# Add this check

# --- END DEBUG STEP ---

    
# Expose port
EXPOSE 3000

# Healthcheck (Optional but Recommended)
# Adjust the path based on your health check endpoint if you have one
# HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
#   CMD curl --fail http://localhost:3000/health || exit 1

# Command to run the application
# Note: 'node dist/main' is standard for compiled NestJS apps
# CMD ["node", "dist/main"]
# --- CORRECTED COMMAND ---
# Use the correct path based on your build output
CMD ["node", "dist/src/main.js"]

# # Use official Node.js LTS Alpine image as a parent image
# FROM node:18-alpine AS development

# # # Install build dependencies
# RUN apk add --no-cache --virtual .build-deps \
#     python3 \
#     make \
#     g++
#     # git \
#     # openssh-client

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json (or yarn.lock)
# COPY package*.json ./

# # Install app dependencies
# RUN npm install
# # RUN npm install --force

# COPY . .

# # Copy prisma schema
# # COPY prisma ./prisma/

# # Generate Prisma Client (optional here, can be done before start)
# # RUN npx prisma generate

# # Explicitly generate Prisma Client during the build
# # RUN npx prisma generate

# # Copy application source
# # COPY . .

# # Cleanup build dependencies (optional)
# # RUN apk del .build-deps

# # Add prisma client generation
# RUN npx prisma generate
# # RUN npx prisma migrate deploy

# # Default command (will be overridden by docker-compose)
# # CMD ["node", "dist/main"]
# CMD ["npm", "run", "start:dev"]

# # --- Production Build Stage (Example, we'll refine later) ---
# # FROM node:18-alpine AS production
# # WORKDIR /app
# # COPY package*.json ./
# # RUN npm install --only=production
# # COPY --from=development /app/dist ./dist
# # COPY --from=development /app/node_modules ./node_modules # If needed
# # COPY --from=development /app/prisma ./prisma
# # CMD ["node", "dist/main"]