FROM node:9.11.1

WORKDIR /rester
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile
ADD app app/
ADD bin bin/

ENV PORT=80 \
    NODE_ENV=production

EXPOSE 80

CMD node /rester/bin/www
