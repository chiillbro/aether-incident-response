#-----------------------------------------Final Production Setup-------------------------------------------------#



# ---- Base ----
FROM node:18-alpine AS base
WORKDIR /app
# Add curl for healthcheck
RUN apk add --no-cache curl

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts # Ignore scripts potentially

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
RUN echo "Build-time NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
RUN npm run build
# Optional: Prune dev dependencies if standalone output doesn't handle it fully
# RUN npm prune --omit=dev

# ---- Production ----
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Copy necessary files owned by the new user
# Important: Copy standalone output FIRST, then public/static if needed by server.js
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Switch to the non-root user
USER nodejs

EXPOSE 3000

# Add Healthcheck (checking the root path is usually fine for Next.js)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Command to run the standalone server
CMD ["node", "server.js"]



# ------------------------------------ Production Setup ----------------------------------- #



# # ---- Base ----
# FROM node:18-alpine AS base
# WORKDIR /app

# # ---- Dependencies ----
# FROM base AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci

# # ---- Builder ----
# FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# # Set NEXT_PUBLIC_API_BASE_URL during build if needed (can also be set at runtime)
# # ARG NEXT_PUBLIC_API_BASE_URL
# # ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# # --- Define ARG and ENV for build time ---
# ARG NEXT_PUBLIC_API_BASE_URL
# ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
# # --- End Change ---

# # Verify the env var during build (optional debug)
# RUN echo "Build-time NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"


# RUN npm run build

# # ---- Production ----
# FROM base AS production
# WORKDIR /app
# ENV NODE_ENV=production

# # Copy minimal necessary files from builder stage
# COPY --from=builder /app/public ./public
# # Copy standalone output
# COPY --from=builder /app/.next/standalone ./
# # Copy static assets
# COPY --from=builder /app/.next/static ./.next/static

# EXPOSE 3000

# # Command to run the standalone server
# CMD ["node", "server.js"]






# ------------------------------------ Development Setup ----------------------------------- #




# # Use official Node.js LTS Alpine image
# FROM node:18-alpine AS development

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# # Expose port 3000 for Next.js dev server
# EXPOSE 3000

# # Default command (will be overridden by docker-compose)
# CMD ["npm", "run", "dev"]

# # --- Production Build Stage (Example, we'll refine later) ---
# # FROM node:18-alpine AS builder
# # WORKDIR /app
# # COPY package*.json ./
# # RUN npm install
# # COPY . .
# # RUN npm run build

# # FROM node:18-alpine AS production
# # WORKDIR /app
# # ENV NODE_ENV production
# # COPY --from=builder /app/public ./public
# # COPY --from=builder /app/.next/standalone ./
# # COPY --from=builder /app/.next/static ./.next/static
# # EXPOSE 3000
# # CMD ["node", "server.js"] # Requires output: 'standalone' in next.config.js