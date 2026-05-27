FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    awscli ca-certificates curl jq && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY deploy/entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 5013
ENTRYPOINT []
CMD ["/app/entrypoint.sh"]
