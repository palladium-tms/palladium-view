FROM ubuntu
EXPOSE 80
RUN mkdir /palladium
WORKDIR /palladium
ADD . /palladium
RUN apt-get update
RUN apt-get install -y curl nginx
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get -y install python-software-properties python g++ make nodejs
RUN npm install -g @angular/cli
RUN ng build --prod --aot false
RUN ln -s //palladium/dist //var/www/palladium
RUN ln -s //palladium/palladium //etc/nginx/sites-enabled/palladium
CMD service nginx start
