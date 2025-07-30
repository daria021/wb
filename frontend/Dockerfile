FROM node:20-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 300000

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copy our custom config file (make sure default.conf is in the same directory as your Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
