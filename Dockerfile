FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci --ignore-scripts

COPY @types ./@types
COPY src ./src
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist

RUN mkdir logs && chown -R node:node /app

EXPOSE 3002

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/app.js"]
