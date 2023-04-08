const Design = require('../models/designModel');


module.exports = {
  getDesignColors: (code) => {
    return new Promise((resolve, reject) => {
      Design.find({designCode: code}).select('colors -_id').then((docs)=> {
        resolve(docs);
      }).catch((err)=> reject(err));
    });
  },
  getColors: async ()=> {
    return await Design.distinct('colors');
  },
  getSizes: async ()=> {
    return await Design.distinct('sizes');
  },
};
