const Admin = require('../models/adminModel');

module.exports = {
  checkEmailExist: (email)=>{
    return new Promise((resolve, reject)=>{
      Admin.findOne({email: email}).then((doc)=>{
        resolve(doc);
      });
    });
  },
  addAdmin: async (adminDetails) => {
    await Admin.create(adminDetails);
  },

};
