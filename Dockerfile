FROM node:current-alpine AS build

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Enable if devDependencies needs to be ignored
# ENV NODE_ENV production

RUN npm ci --install-strategy=linked

# Bundle app source
COPY . .

RUN npm run build

# https://docs.docker.com/build/building/multi-stage/
FROM node:current-alpine

ENV NODE_ENV production

# Create app directory
WORKDIR /app

# Bundle app source
COPY --from=build /app/build ./build

# Remix app source
# COPY --from=build /app/public ./public

COPY --from=build /app/package.json ./

COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

CMD [ "node", "build" ]
