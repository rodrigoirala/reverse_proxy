const readline = require('readline');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const config = require('config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const mongoClient = new MongoClient( config.PROXY_LOG.server_url );
mongoClient.connect().then((rst) => {
  mongoClient.db( config.PROXY_LOG.database )
  .command({ ping: 1 }).then((rst)=>{
    const proxyCon = mongoClient.db( config.PROXY_LOG.database );
    
    console.log('Conexión a la base de datos establecida correctamente');
    const users = proxyCon.collection('users');
    rl.question('Email: ', async (email) => {
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        console.log('El usuario ya existe');
        rl.close();
        mongoClient.close();
      } else {
        rl.question('Contraseña: ', async (password) => {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);
          const newUser = { email, password: hash };
          await users.insertOne(newUser);
          console.log('Usuario registrado correctamente');
          rl.close();
          mongoClient.close();
        });
      }
    });
  });
});