FROM  node

WORKDIR  /app

COPY package.json .

RUN npm install

ADD . .

EXPOSE $PORT

# Set the base url
ENV REACT_APP_PROXY_API =$REACT_APP_PROXY_API 

CMD ["npm", "start"]


# RUN mkdir -p /home/app

# COPY package.json .
# COPY . /home/app

# CMD ["npm", "start"]