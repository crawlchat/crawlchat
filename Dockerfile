FROM node:20-alpine

COPY server /app

COPY libs /libs

WORKDIR /app

RUN npm install

RUN npx playwright install-deps
RUN npx playwright install

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]