FROM node:20-bullseye AS base

ARG BUILD_APP

RUN npm install -g turbo

WORKDIR /app

COPY . .

RUN turbo prune ${BUILD_APP}

WORKDIR /app/out

RUN npm i

RUN turbo run build --filter=${BUILD_APP}

WORKDIR /app/out/${BUILD_APP}

EXPOSE 3000

CMD ["npm", "run", "start"]
