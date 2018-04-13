FROM node:9.11.1

WORKDIR /rester
ADD app app/
ADD bin bin/
ADD certificates certificates/
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile

ENV PORT=80 \
    NODE_ENV=production

EXPOSE 80

CMD node /rester/bin/www
