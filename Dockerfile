FROM ubuntu:latest
MAINTAINER affearteam

EXPOSE 3000

# Update and install dependencies
RUN apt-get update && apt-get install -y wget python git python-software-properties g++ make

# Install Node.js
RUN wget http://nodejs.org/dist/v0.10.35/node-v0.10.35-linux-x64.tar.gz -O node.tar.gz
RUN mkdir node
RUN tar -zxvf node.tar.gz -C node --strip-components 1 && rm node.tar.gz
ENV PATH /node/bin:$PATH

# Copy and install polyphemus 
ADD app app/
WORKDIR app
RUN npm install
RUN npm install -g bower
RUN bower install --allow-root

# cd to root dir
WORKDIR /

# Copy and make script runnable
ADD scripts scripts/
RUN chmod a+x scripts/run.sh

CMD ["/scripts/run.sh"]