FROM keymetrics/pm2:18-buster

RUN pm2 install pm2-prom-module
RUN pm2 set pm2-prom-module:service_name reverseproxy
