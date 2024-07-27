FROM node:20.14-alpine

COPY ./ /app

WORKDIR /app

RUN npm install

CMD ["npm", "start"]

# Note, not optimised for production as it will just be used as a harness
