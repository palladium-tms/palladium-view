FROM node:20.15.0-buster

RUN mkdir /palladium-view
COPY . /palladium-view
WORKDIR /palladium-view

RUN npm install -g @angular/cli --unsafe-perm && npm install

ENTRYPOINT ["ng"]
CMD ["build", "--prod", "--aot=false"]
