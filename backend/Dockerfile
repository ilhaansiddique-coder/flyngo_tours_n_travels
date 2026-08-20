FROM node:22-alpine AS builder

WORKDIR /app

COPY .npmrc package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund --prefer-offline

COPY . .

ARG GIT_SHA=dev
ARG GIT_COMMIT_MESSAGE="local build"
ARG GIT_COMMIT_AUTHOR="unknown"
ARG GIT_COMMIT_DATE=""
ARG GIT_BRANCH=main
ARG GIT_REPO=ilhaansiddique-coder/flyngo_tours_n_travels

ENV GIT_SHA=$GIT_SHA \
    GIT_COMMIT_MESSAGE=$GIT_COMMIT_MESSAGE \
    GIT_COMMIT_AUTHOR=$GIT_COMMIT_AUTHOR \
    GIT_COMMIT_DATE=$GIT_COMMIT_DATE \
    GIT_BRANCH=$GIT_BRANCH \
    GIT_REPO=$GIT_REPO

RUN npm run build

FROM node:22-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && \
    mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
