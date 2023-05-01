const express = require('express');

const app = express();
const db = require('./config/db.config');
require('dotenv').config();


db.connect()
    .then(async ()=>{
      require('./config/middleware.config')(app, express);
      require('./config/route.config')(app);
      require('./config/server.config');
    })
    .catch((err)=>{
      console.error(err);
    });

module.exports = app;


