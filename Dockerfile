FROM node:10.14.0-jessie
RUN mkdir /palladium-view
WORKDIR /palladium-view
COPY . /palladium-view
RUN npm install
RUN npm run build
CMD bash wait_for_volume.sh
