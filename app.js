const express = require('express');

const app = express();
const db = require('./src/config/db.config');
require('dotenv').config();


db.connect()
    .then(async ()=>{
      require('./src/config/middleware.config')(app, express);
      require('./src/config/route.config')(app);
      require('./src/config/server.config');
    })
    .catch((err)=>{
      console.error(err);
    });

module.exports = app;


