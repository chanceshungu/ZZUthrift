FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN npm audit fix --audit-level=moderate

EXPOSE 8000

USER node

CMD ["node", "server.js"]
