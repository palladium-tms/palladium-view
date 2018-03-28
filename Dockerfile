FROM node:8.1.4
ARG config
RUN mkdir /palladium-view
WORKDIR /palladium-view
ADD . /palladium-view
RUN npm run build
#RUN if [ -z "$config" ] ; then $config='{"host":"http://'$(wget -qO- ipinfo.io/ip)'"}';fi
#RUN echo $config > config.json
#RUN npm install -g @angular/cli --unsafe-perm
#RUN npm install
#RUN ng build --prod --aot false
CMD bash wait_for_volume.sh
