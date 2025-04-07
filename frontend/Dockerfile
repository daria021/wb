# Dockerfile.env для фронтенда
FROM node:20-alpine as build

WORKDIR /app

# Копируем package.json и yarn.lock для установки зависимостей
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile --network-timeout 300000

# Копируем весь проект
COPY . .

RUN yarn build

# Stage 3: Serve with Nginx
FROM nginx:latest
COPY --from=build /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
