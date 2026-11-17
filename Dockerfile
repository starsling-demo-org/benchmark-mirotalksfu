# syntax=docker/dockerfile:1.6

# Pinned, statically-linked FFmpeg (multi-arch, no shared-lib deps).
# FFmpeg >= 9.0 contains the vobsub subtitle demuxer stream-count bounds fix
# (FFmpeg commit dbd495f066a85ba96b17433f4306582aa37c3951). Debian bookworm's apt
# ffmpeg (5.1.9) is still vulnerable to that heap buffer overflow and has no backport,
# so we ship a fixed static build instead of installing ffmpeg from apt.
FROM mwader/static-ffmpeg:9.0.2 AS ffmpeg

# Use Node.js 24 LTS slim image as base
FROM node:24-slim AS base

# Set working directory
WORKDIR /src

# Environment
ENV NODE_ENV=production
ENV MEDIASOUP_SKIP_WORKER_PREBUILT_DOWNLOAD=true

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# The mediasoup version package-lock.json pins, read on the build machine.
FROM --platform=$BUILDPLATFORM node:24-slim AS mediasoup-version
COPY package-lock.json /tmp/
RUN node -p "require('/tmp/package-lock.json').packages['node_modules/mediasoup'].version" > /mediasoup-version

# mediasoup's C++ worker, built from source as before, in a stage keyed on the mediasoup version alone: the app's
# version bumps and other dependency updates no longer rebuild it (106 min under QEMU for arm64).
FROM base AS mediasoup-worker
COPY --from=mediasoup-version /mediasoup-version /tmp/mediasoup-version
RUN --mount=type=cache,target=/root/.npm \
    mkdir /tmp/mediasoup && cd /tmp/mediasoup \
    && npm install --no-save "mediasoup@$(cat /tmp/mediasoup-version)" \
    && test -x node_modules/mediasoup/worker/out/Release/mediasoup-worker

FROM base

# Install the fixed, statically-linked FFmpeg/ffprobe over the paths the app resolves
# (config default /usr/bin/ffmpeg and bare `ffmpeg` on PATH).
COPY --from=ffmpeg /ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg /ffprobe /usr/bin/ffprobe

# Install dependencies (cache npm). MEDIASOUP_WORKER_BIN tells mediasoup's install step to skip its worker build;
# the worker built above goes where mediasoup loads it from. One npm cache per CPU type: the postinstall's
# `npx esbuild` keeps a native esbuild binary in it, and both CPUs now run this step at the same time.
COPY package*.json ./
ARG TARGETARCH
RUN --mount=type=cache,target=/root/.npm,id=npm-$TARGETARCH \
    MEDIASOUP_WORKER_BIN=/src/node_modules/mediasoup/worker/out/Release/mediasoup-worker npm ci --omit=dev
COPY --from=mediasoup-worker /tmp/mediasoup/node_modules/mediasoup/worker/out ./node_modules/mediasoup/worker/out
COPY --from=mediasoup-worker /tmp/mediasoup/node_modules/mediasoup/worker/pip_invoke ./node_modules/mediasoup/worker/pip_invoke

# Avoid recursive chown, which duplicates /src into a costly overlayfs layer.
# Dependencies remain root-owned and readable; application files are owned by node.
COPY --chown=node:node app ./app
COPY --chown=node:node public ./public

# Copy config template → config
COPY --chown=node:node app/src/config.template.js app/src/config.js

# Run as the non-root "node" user (uid/gid 1000) shipped with the base image
USER node

# Default command: run node directly (not via npm) so SIGTERM from `docker stop`
# reaches the app and triggers the graceful shutdown (clients get notified and auto-reconnect)
CMD ["node", "app/src/Server.js"]