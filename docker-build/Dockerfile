FROM node:16.17.1-buster

WORKDIR /palladium-view
COPY . .

RUN npm install
RUN npm run build-aot-disable

CMD [ "ls", "-l", "dist" ]
