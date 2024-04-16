const { json } = require('express');

module.exports = async (ctx, next) => {

  const config = require('config');

  if (!config?.PROXY_LOG?.enabled){
    return await next();
  }

  const dbCon = ctx.app.context.mongoDB;
  try {
    const requestCol = dbCon.collection('requests');
    await requestCol.insertOne(
      {url:  ctx.url, 
      headers: ctx.headers, 
      createdAt: new Date()}
    );
    console.log('%s .Log data successfully saved in requests' ,(new Date()).toISOString());
  } catch (e) {
    console.log("%s .Log data couldn't be saved in requests . Error: %s", (new Date()).toISOString(), e.message);
  }

  await next();

  let responseColName = "responses";
  if ( ![200, 201, 202, 203, 204, 205, 206, 503].includes( ctx.status) ){
    responseColName = 'responses_wrong';
  }
  if ( ctx.status == 503 ){
    responseColName = 'responses_service_unavailable';
  }

  try {
    const responseCol = dbCon.collection(responseColName);
    await responseCol.insertOne( 
      {statusCode: ctx.status, 
      requestUrl: ctx.url, 
      headers: ctx.headers, 
      createdAt: new Date()}
    );
    console.log('%s .Log data successfully saved in %s' ,(new Date()).toISOString(), responseColName);
  } catch(e) {
    console.log("%s .Log data couldn't be saved in %s. Error: %s ", (new Date()).toISOString(), responseColName, e.message);
  }
}