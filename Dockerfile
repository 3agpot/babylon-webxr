FROM node:latest
COPY . /app
WORKDIR /app
RUN npm i -g http-server
CMD http-server -p 7172 .
