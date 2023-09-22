FROM node:16-alpine3.14
WORKDIR /usr/intergalactic-indexer
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN mkdir -p build/artifacts
COPY src/artifacts/* build/artifacts/
CMD [ "npm", "start" ]