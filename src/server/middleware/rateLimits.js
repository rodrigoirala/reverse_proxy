module.exports = (redisStore) => {

  const config = require('config');
  const RateLimit = require('koa2-ratelimit').RateLimit;
  const rateLimit = config.RATE_LIMIT_OPTIONS;
  const skipRoutes = config.RATE_LIMIT_SKIP_ROUTES || [];
  const ipsWhitelist = config.RATE_LIMIT_IPS_WHITELIST || [];

  const limiter = RateLimit.middleware( 
    {...rateLimit,
    store : redisStore,
    skip : async function (ctx) {
      const itsARouteToSkip = skipRoutes.reduce(
        (previousValue, currentValue) => previousValue || ctx.path.includes( currentValue) ,
        false
      );
      const itsAnIPToSkip = ipsWhitelist.includes(ctx.request.ip);
      const shouldSkip = itsARouteToSkip || itsAnIPToSkip;
      const storedMsg = 'stored in rate-limiter';
      console.log("%s .Requested path %s from %s %s " ,(new Date()).toISOString(), ctx.path, ctx.request.ip, (!shouldSkip ? storedMsg: ''));

      return shouldSkip;
    },
    handler: async function (ctx) {
      ctx.status = this.statusCode;
      ctx.body = { message: this.message };
      if (this.headers) {
          ctx.set('Retry-After', Math.ceil(this.interval / 1000));
      }
      console.log("%s .Limit of %i during interval %s reached by %s requesting path %s" , (new Date()).toISOString(), this.max, this.interval, ctx.request.ip, ctx.path);
    }
  });
  return limiter;
}
