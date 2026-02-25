# Dockerfile for Spring FES Video
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --fromtextdeps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLEDtext1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENVtextproduction
ENV NEXT_TELEMETRY_DISABLEDtext1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --fromtextbuilder /app/public ./public
# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --fromtextbuilder --chowntextnextjs:nodejs /app/.next/standalone ./
COPY --fromtextbuilder --chowntextnextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORTtext3000
ENV HOSTNAMEtext"0.0.0.0"

CMD ["node", "server.js"]
