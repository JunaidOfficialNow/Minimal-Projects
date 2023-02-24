const Category = require('../models/categoryModel');


module.exports = {
  addCategory: (details)=>{
    return new Promise((resolve, reject)=>{
      Category.create(details).then((doc)=>{
        resolve(doc);
      }).catch((err)=>{
        reject(err);
      });
    });
  },
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
  getAllCategories: ()=>{
    return new Promise((resolve, reject)=>{
      Category.find({}).then((docs)=>{
        resolve(docs);
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  deleteCategory: (id)=>{
    return new Promise((resolve, reject)=>{
      Category.findByIdAndRemove(id).then((doc)=>{
        resolve({image: doc.image, name: doc.name});
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  deactivateCategory: (id)=>{
    return new Promise((resolve, reject)=>{
      Category.findByIdAndUpdate(id, {isActive: false}).then((doc)=>{
        if (doc) {
          Category.findById(id).then((doc)=>{
            resolve(doc);
          });
        } else {
          resolve({error: 'Category  may have already be  deleted'});
        };
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  activateCategory: (id)=>{
    return new Promise((resolve, reject)=>{
      Category.findByIdAndUpdate(id, {isActive: true}).then((doc)=>{
        if (doc) {
          Category.findById(id).then((doc)=>{
            resolve(doc);
          });
        } else {
          resolve({error: 'Category  may have already be  deleted'});
        };
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  getCategoryDetails: (id) => {
    return new Promise((resolve, reject) => {
      Category.findById(id).then((doc) => {
        if (doc) {
          resolve(doc);
        } else {
          resolve({error: 'Category  may have already be  deleted'});
        }
      }).catch((err) => {
        reject(err);
      });
    });
  },
  updateCategory: (id, details)=>{
    return new Promise((resolve, reject)=>{
      Category.findByIdAndUpdate(id, details).then((doc)=>{
        if (doc) {
          Category.findById(id).then((doc)=>{
            resolve(doc);
          });
        } else {
          resolve({error: 'Category  may have already be  deleted'});
        }
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  updateCategoryImage: (id, image)=>{
    return new Promise((resolve, reject)=>{
      Category.findByIdAndUpdate(id, {image: image}).then((doc)=>{
        if (doc) {
          Category.findById(id).then((doc)=>{
            resolve(doc);
          });
        } else {
          resolve({error: 'Category  may have already be  deleted'});
        }
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  getCategoryNames: () => {
    return new Promise((resolve, reject) => {
      Category.find({}).select('name -_id').then((docs) => {
        resolve(docs);
      }).catch((err) => {
        reject(err);
      });
    });
  },
};


