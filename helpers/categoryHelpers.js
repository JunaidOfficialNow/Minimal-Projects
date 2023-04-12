const Category = require('../models/categoryModel');


module.exports = {
  checkCategoryExists: (name)=>{
    return new Promise((resolve, reject)=>{
      Category.findOne({name: name}).then((doc)=>{
        if (doc) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject();
        } else resolve();
      });
    });
  },
  checkCategoryExistsById: (id) => {
    return new Promise((resolve, reject)=>{
      Category.findById(id).then((doc)=>{
        if (doc) {
          resolve(doc.name);
        } else resolve({error: 'Category may have already been deleted'});
      });
    });
  },
};


