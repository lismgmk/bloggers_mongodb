#!/usr/bin/bash

cd ./deploy/dev && \
docker-compose -p pg-server \
    up --build 

docker-compose exec shard01-a sh -c "mongosh < /scripts/init-shard01.js"