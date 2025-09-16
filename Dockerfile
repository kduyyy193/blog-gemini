FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:lts-alpine AS production

WORKDIR /app

COPY package.json ./
RUN yarn install --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 3339

CMD ["node", "dist/main"]