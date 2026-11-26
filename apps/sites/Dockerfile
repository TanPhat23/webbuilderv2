FROM oven/bun:1.4.5-alpine AS builder
WORKDIR /app

COPY package.json bunfig.toml bun.lock ./
COPY packages/site-runtime/package.json ./packages/site-runtime/package.json
COPY apps/editor/package.json ./apps/editor/package.json
COPY apps/sites/package.json ./apps/sites/package.json

RUN bun install --frozen-lockfile

COPY tsconfig.base.json tsconfig.json ./
COPY packages/site-runtime ./packages/site-runtime
COPY apps/sites ./apps/sites

ARG VITE_API_URL
ARG VITE_GO_SERVER_URL
ARG VITE_SITE_DOMAIN
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GO_SERVER_URL=${VITE_GO_SERVER_URL}
ENV VITE_SITE_DOMAIN=${VITE_SITE_DOMAIN}
ENV NITRO_PRESET=node-server

RUN bun run --cwd apps/sites build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/apps/sites/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
