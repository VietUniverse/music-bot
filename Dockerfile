FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

# Lavalink.jar không commit vào repo — tải lúc build
RUN curl -fsSL -o Lavalink.jar \
      "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar"

ENV USE_LOCAL_LAVALINK=1 \
    LAVALINK_HOST=127.0.0.1 \
    LAVALINK_PORT=2333 \
    PORT=8080 \
    NODE_ENV=production

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/health || exit 1

CMD ["bash", "scripts/run.sh"]
