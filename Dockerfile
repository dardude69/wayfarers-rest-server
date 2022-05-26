FROM node:18-alpine

# directory choice is arbitrary
WORKDIR /app

# install node-gyp dependencies
RUN apk add --no-cache g++ make python3

# # install project dependencies
COPY package.json package-lock.json .

# "By default the node-gyp install will use python as part of the installation."
# "A different python executable can be specified on the command line."
RUN npm install --build-from-source --python=/usr/bin/python3

COPY . .

EXPOSE 80/tcp
ENTRYPOINT ["npm", "run", "start"]
