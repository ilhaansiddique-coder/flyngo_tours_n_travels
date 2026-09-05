FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --prefer-offline

COPY . .

ARG BACKEND_URL=http://backend:4000
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_VBT_BASE_PATH=/VBT
ARG NEXT_PUBLIC_VBT_USE_BASEPATH=true

ENV BACKEND_URL=$BACKEND_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_VBT_BASE_PATH=$NEXT_PUBLIC_VBT_BASE_PATH \
    NEXT_PUBLIC_VBT_USE_BASEPATH=$NEXT_PUBLIC_VBT_USE_BASEPATH \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    BACKEND_URL=http://backend:4000 \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

CMD ["node", "server.js"]