FROM node:8.1.4
EXPOSE 80
RUN echo $API_ENDPOINT
RUN mkdir /palladium-view
WORKDIR /palladium-view
ADD . /palladium-view
#RUN npm install -g @angular/cli --unsafe-perm && npm i
RUN apt-get update && apt-get install -y nginx
#RUN ng build --prod --aot false
RUN ln -s //palladium-view/dist //var/www/palladium \
    && ln -s //palladium-view/palladium //etc/nginx/sites-enabled/palladium \
    && rm //etc/nginx/sites-enabled/default
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
RUN $API_ENDPOINT >> 1.txt
