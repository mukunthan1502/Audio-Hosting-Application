FROM  node

ENV MONGO_DB_USERNAME=$MONGO_DB_USERNAME \
    MONGO_DB_PWD=$MONGO_DB_PWD \
    MONGO_URL=$MONGO_URL \
    PORT=$PORT \
    JWT_SECRET=s12xyz00 \
    JWT_SESSION_TIME=360000 \
    ENCRYPT_ALGORITHM=aes-256-ctr \
    ENCRYPT_SECRETKEY=vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3 \
    HASH_SALT_COUNT=10 

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
ADD . .

EXPOSE $PORT
EXPOSE 8080
CMD [ "node", "server.js" ]

# RUN mkdir -p /home/app

# COPY . /home/app

# CMD ["node", "/home/app/server.js"]