#!/bin/sh

npm cache clean -f
npm install --production
npm run postinstall
