FROM node:19.8.1-bullseye-slim

RUN mkdir -p /uno

WORKDIR /uno

COPY . /uno

RUN npm run ci:unapy

ENV PORT 80

ENV NODE_ENV production

EXPOSE 80 3667

CMD [ "npm", "run", "start:unapy" ]
