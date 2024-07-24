FROM node:16.17.1-buster

RUN mkdir /palladium-view
COPY . /palladium-view
WORKDIR /palladium-view

RUN npm install -g @angular/cli --unsafe-perm && npm install

ENTRYPOINT ["ng"]
CMD ["build", "--prod", "--aot=false"]
