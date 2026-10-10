FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/engine/package.json ./packages/engine/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY packages/engine ./packages/engine
COPY packages/server ./packages/server

RUN pnpm --filter @uzmonopoly/shared run build && \
    pnpm --filter @uzmonopoly/engine run build && \
    pnpm --filter @uzmonopoly/server run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=2567

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/engine/package.json ./packages/engine/
COPY --from=builder /app/packages/engine/dist ./packages/engine/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules

# Run as non-root node user
RUN chown -R node:node /app
USER node

EXPOSE 2567

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 2567) + '/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "packages/server/dist/index.js"]
