FROM node:22-alpine AS base

# Install libc6-compat for Alpine compatibility with native tools
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./dev.db"
ENV AUTH_SECRET="production-docker-build-secret-key-32chars"

RUN npx prisma generate
RUN npm run build

# Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Make sure nextjs user can write to prisma directory for SQLite database
RUN chown -R nextjs:nodejs /app/prisma /app/.next

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npm start"]
