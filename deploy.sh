#!/bin/sh

docker-compose -f docker-compose-build.yml down
docker-compose -f docker-compose-build.yml up
docker-compose up -d
