FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 300000

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build

# Stage 2: Serve with Nginx
FROM macbre/nginx-http3:latest

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
