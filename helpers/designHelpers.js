const Design = require('../models/designModel');


module.exports = {
  addDesign: (details) => {
    return new Promise((resolve, reject) => {
      Design.create(details).then((doc)=> {
        resolve(doc);
      }).catch((err)=> reject(err));
    });
  },
  getDesigns: () => {
    return new Promise((resolve, reject) => {
      Design.find({}).then((docs)=> {
        resolve(docs);
      }).catch((err)=> reject(err));
    });
  },
  checkCodeExists: (code) => {
    return new Promise((resolve, reject) => {
      Design.findOne({designCode: code}).then((doc)=> {
        resolve(doc);
      }).catch((err)=> reject(err));
    });
  },
  getDesignCodes: () => {
    return new Promise((resolve, reject) => {
      Design.distinct('designCode').then((docs)=> {
        resolve(docs);
      }).catch((err)=> reject(err));
    });
  },
  deleteDesigns: (name) => {
    return new Promise((resolve, reject) => {
      Design.deleteMany({category: name}).then((docs) => {
        resolve();
      }).catch((err)=> {
        reject(err);
      });
    });
  },
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
