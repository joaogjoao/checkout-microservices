FROM node:latest AS builder

WORKDIR /usr/src/app
ENV NODE_ENV=development

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:latest AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main.js"]
