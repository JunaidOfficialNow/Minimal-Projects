const mongoose = require('mongoose');


mongoose.set('strictQuery', false);

/**
 * database connection function;
 * @return {obiect}
 */
module.exports.connect = function() {
  return new Promise((resolve, reject)=>{
    mongoose.connect(process.env.MONGO_URL)
        .then(()=>{
          console.log('database success');
          resolve();
        }).catch((err)=>{
          reject(err);
          console.error(err.message);
        });
  });
};

