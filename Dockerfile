FROM node:20.15.0-buster

RUN mkdir /palladium-view
COPY . /palladium-view
WORKDIR /palladium-view

RUN npm install
RUN npm run build

CMD ["bash", "wait_for_volume.sh"]
