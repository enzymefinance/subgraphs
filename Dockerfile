# -----------------------------------------------------------------------------
# base
# -----------------------------------------------------------------------------
FROM node:11 as base

RUN wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-alpine-linux-amd64-v0.6.1.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-v0.6.1.tar.gz \
  && rm dockerize-alpine-linux-amd64-v0.6.1.tar.gz

# -----------------------------------------------------------------------------
# builder
# -----------------------------------------------------------------------------
FROM base as builder
WORKDIR /app

COPY yarn.lock package.json ./
RUN yarn --frozen-lockfile --pure-lockfile --development && yarn cache clean

CMD ["yarn", "run"]
