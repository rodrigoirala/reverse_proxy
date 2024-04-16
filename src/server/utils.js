
function getMatchedPath(requestPath) {
  const config = require('config');
  const {enabled, regexPaths} = config.METRICS;

  let  matchedPath = requestPath;

  if (!enabled){
    return requestPath;
  }

  for( const regPath of regexPaths){
    const match = new RegExp( regPath).exec( requestPath);
    if ( match ) {
      matchedPath = regPath;
      break;
    }
  }
  
  return matchedPath;
}


function registerMetrics(){
  const client = require( 'prom-client');
  const { initMetrics }  = require( 'pm2-prom-module-client');

  const registry = new client.Registry();

  const metricRequestCounter = new client.Counter({
      name: `ReverseProxy_request_counter`,
      help: 'Show total request count',
      registers: [registry],
  });
  
  const metricPathRequested = new client.Gauge({
    name: 'nodejs_app_requested_path',
    help: 'Moments handling a HTTP Request by path',
    registers: [registry],
    labelNames: ['path', "method"],
  });

  const metricProxyingRequest = new client.Histogram({
    name: 'nodejs_app_proxying_request',
    help: 'Time spent processing a HTTP Request by path',
    registers: [registry],
    buckets: [1,2,5,10],
    labelNames: ['path', 'method', 'statusCode']
  });

  // Register your `registry` to send data to pm2-prom-module
  initMetrics(registry);

  return { 'metricRequestCounter': metricRequestCounter,
  'metricPathRequested': metricPathRequested,
  'metricProxyingRequest': metricProxyingRequest };
}

module.exports = {getMatchedPath, registerMetrics};