
const config = require('config');
const jwt = require('jsonwebtoken');

const requiredQueryTokenPaths = config.PROXY_OPTIONS.filter(ele=> {
  return ('queryTokenRequired' in ele) && ele.queryTokenRequired == true;
}).map(ele=> new RegExp(ele.sourcePath));
/**
 * Middleware para controlar que el path solicitado necesite token de acceso y el token sea el correcto
 * @param ctx
 * @param next
 */
 module.exports = async (ctx, next) => {

  const requestRequiresQueryToken = requiredQueryTokenPaths.some( path => {
      return ctx.path.match( path);
  });

  if (requestRequiresQueryToken){ 
    const {token, ...queryOthers} = ctx.request.query;

    if (!token){
      ctx.status = 401;
      ctx.body = { Error: "Se requiere token de acceso"};
      return;
    }

    try {
      const {resourcePath} = jwt.verify(token, config.jwtSecretKey);
      if ( !resourcePath  || resourcePath != ctx.request.path ){
        ctx.status = 403;
        ctx.body = { Error: "Token de acceso inválido para el recurso solicitado"};
        return;
      }
      console.log('"%s .Token validation successfull. Ip client: %s', (new Date()).toISOString(), ctx.socket.remoteAddress);
      
      ctx.request.query = queryOthers;
    } catch(err) {
      ctx.status = 403;
      ctx.body = { Error: "Token de acceso inválido o expirado"};
      return;
    }
  }

  await next()
}
