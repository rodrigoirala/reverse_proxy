/* 'use strict'; */

function addProxies( app){
  const proxies = require('./middleware/proxies');
  const proxy = require('koa-proxies');
  const proxiesOptions = proxies(); 

  for( const proxyOption of proxiesOptions){
    app.use( proxy(
      new RegExp( proxyOption.sourcePath),
      proxyOption.options,
    ));
  }
}

function registerMiddlewares(app, config){

  if (config?.METRICS?.enabled ){
    const {registerMetrics} = require('./utils');
    const metricsRegisters = registerMetrics();
    app.context.metricsRegisters = metricsRegisters;
    const metricsMiddleware = require('./middleware/metrics');
    app.use( metricsMiddleware );
  }

  const Stores = require('koa2-ratelimit').Stores;
  const redisStore = new Stores.Redis( config.RATE_LIMIT_DB_CONNECTION_OBJECT );
  const limiter = require('./middleware/rateLimits')(redisStore);
  app.use( limiter );

  const auth = require('./middleware/queryTokenAuthorize');
  app.use( auth );

  const noAuthRequiredPaths = config.PROXY_OPTIONS.filter(ele=> {
    return ('authRequired' in ele) && ele.authRequired == false;
  }).map(ele=> new RegExp( ele.sourcePath));
  noAuthRequiredPaths.push('/login');
  noAuthRequiredPaths.push('/');

  const jwtMiddleware = require('koa-jwt');
  app.use(jwtMiddleware({ secret: config.jwtSecretKey }).unless({path: noAuthRequiredPaths}));
  
  const staticRoutes = require('./middleware/staticRoutes');
  app.use(staticRoutes());

  const logMdlw = require('./middleware/log');
  app.use( logMdlw );
  addProxies( app);
}

function createExpressApp(){
  
  const config = require('config');
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';

  const app = new (require('koa'));
  registerMiddlewares(app, config);
  app.on('error', err => {
    console.log('Server error', err)
  });

  if (config?.PROXY_LOG?.enabled){
    const { MongoClient } = require('mongodb');
    const mongoOptions = {maxPoolSize: config.PROXY_LOG.pool_size};
    (new MongoClient( config.PROXY_LOG.server_url, mongoOptions ))
    .connect().then((client) => {
      const dbCon = client.db( config.PROXY_LOG.database );
      app.context.mongoDB = dbCon;
      console.log('Log database connected successfully');
    }).catch((error)=>{
      console.log('Log error %s', error.message);
      throw error;
    });
  }
  
  const expressapp = require('express')();
  expressapp.use(app.callback());

  /**
   * Greenlock requiere que no haga el listen del server, entonces únicamente para desarrollo se lo crea.
   */
  if (process.env.NODE_ENV == 'development') {
    expressapp.listen(config.port, () => {
      console.log(`App listening on port ${config.port} in dev mode`)
    })
  }

  return expressapp;
}

module.exports = createExpressApp();
