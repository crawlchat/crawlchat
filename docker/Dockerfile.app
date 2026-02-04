FROM node:20-bookworm AS node-build

WORKDIR /app

COPY . .

RUN npm i

RUN npx turbo run build --filter=front --filter=server --filter=source-sync --filter=discord-bot --filter=slack-app

FROM node:20-bookworm AS app

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv supervisor && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=node-build /app /app

RUN python3 -m venv /app/venv && /app/venv/bin/pip install -r /app/marker/requirements.txt

COPY docker/supervisord.conf /etc/supervisor/conf.d/crawlchat.conf

EXPOSE 3001 3002 3003 3004 3005

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
