FROM node:16.17.1-buster

# Install necessary dependencies
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /palladium-view
WORKDIR /palladium-view
COPY . /palladium-view

RUN npm install

CMD ["npm", "run", "ng", "test"]
