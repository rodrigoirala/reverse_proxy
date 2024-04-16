
/**
 * Middleware para registrar metricas en pm2-prom-module
 * @param ctx
 * @param next
 */
 module.exports = async (ctx, next) => {
  const requestStartsAt = Date.now();

  ctx.app.context.metricsRegisters.metricRequestCounter?.inc();
  const {getMatchedPath} = require('../utils');
  const matchetPath = getMatchedPath(ctx.path);
  ctx.app.context.metricsRegisters.metricPathRequested.labels({ path: matchetPath , method:  ctx.method }).inc();
  const metricProxyingRequestEnder = ctx.app.context.metricsRegisters.metricProxyingRequest.startTimer();

  await next();

  const requestEndsAt = Date.now();
  const ms = requestEndsAt - requestStartsAt;
  metricProxyingRequestEnder({ path: matchetPath , method:  ctx.method, statusCode: ctx.status});
  console.log('%s .Response time: %s ms' ,(new Date()).toISOString(), ms);
}
