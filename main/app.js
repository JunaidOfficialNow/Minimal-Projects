const express = require('express');

const app = express();
const db = require('../config/db');
require('dotenv').config();


db.connect()
    .then(async ()=>{
      require('./middlewareConfig')(app, express);
      require('./routeConfig')(app);
      require('../config/server.config');
    })
    .catch((err)=>{
      console.error(err);
    });

module.exports = app;


