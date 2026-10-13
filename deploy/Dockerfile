# syntax=docker/dockerfile:1
# Mable (Astro static game) — build with pnpm, serve the prerendered dist/ from a
# rootless Caddy under /game/mable/ (Astro `base`). TLS/HSTS stay at the front.
#
# Build context MUST be the repo root:
#   docker build -f deploy/Dockerfile -t mini.local/registry/mablegame-web:latest .

# --- build: astro build + workbox SW (toolchain never ships) ---
FROM node:24-bookworm-slim AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src
RUN pnpm run build

# --- run: static files under /srv/game/mable, rootless listener ---
FROM caddy:2-alpine AS run
RUN addgroup -S caddy && adduser -S -D -H -G caddy caddy \
  && chown -R caddy:caddy /config /data
COPY deploy/Caddyfile /etc/caddy/Caddyfile
# dist/ is the site root WITHOUT the /game/mable/ prefix (Astro bakes the prefix
# into the URLs, not the file layout); landing it under /srv/game/mable makes
# every baked URL resolve off a plain `root * /srv`.
COPY --from=build --chown=caddy:caddy /app/dist /srv/game/mable
USER caddy
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:8080/game/mable/" || exit 1
