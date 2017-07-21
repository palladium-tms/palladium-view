FROM node:8.1.4
RUN mkdir /palladium-view
WORKDIR /palladium-view
ADD . /palladium-view
RUN npm install -g @angular/cli --unsafe-perm && npm i
RUN ng build --prod --aot false
