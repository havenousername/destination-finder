FROM node:16-alpine as build

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g dotenv-cli

COPY . .
RUN npm run build

RUN npm install -g serve

COPY .env .
#FROM nginx:1.21.5-alpine as release
#WORKDIR /usr/share/nginx/html/
#COPY --from=build /app/build .
EXPOSE 80

CMD ["dotenv", "-e", ".env", "--", "npx", "serve", "-s", "build", "-l", "80"]