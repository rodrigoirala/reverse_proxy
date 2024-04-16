module.exports = () => {
  const config = require('config');
  const bcrypt = require('bcrypt');
  const Router = require('koa-router');
  const jwt = require('jsonwebtoken');
  const router = new Router();
  const { koaBody } = require('koa-body');

  router.post('/login', koaBody(), async (ctx) => {
    if (!ctx.request.body) {
      ctx.status = 406;
      ctx.body = { message: 'Faltan credenciales' };
      return ;
    }

    const { email, password, resourcePath, tokenExpiresIn} = ctx.request.body;

    if (!email || !password || !resourcePath) {
      ctx.status = 406;
      ctx.body = { message: 'Faltan credenciales' };
      return ;
    }

    const users = ctx.mongoDB.collection('users');
    const user = await users.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const jwtOptions = { expiresIn: tokenExpiresIn || config.jwtDefaultTTL};
      const payload = {"email": email, "resourcePath": resourcePath};
      const token = jwt.sign( payload, config.jwtSecretKey, jwtOptions);
      ctx.body = { token };
    } else {
      ctx.status = 401;
      ctx.body = { message: 'Credenciales inválidas' };
    }
  });

  router.get('/', async (ctx) => {
    if (config.landingPageRedirect && config.landingPageRedirect != ''){
      ctx.redirect(config.landingPageRedirect);
    } else {
      ctx.body = 'hi';
    }
  });

  return router.routes();
}
