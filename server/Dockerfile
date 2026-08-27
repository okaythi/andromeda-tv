FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm install && apk del python3 make g++

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
