/* eslint-disable require-jsdoc */
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');
const {blockUser, getAllUsers, unblockUser} = require('../helpers/userHelpers');
const categoryHelpers = require('../helpers/categoryHelpers');
const bannerHelpers = require('../helpers/bannerHelpers');
const designHelpers = require('../helpers/designHelpers');
const sendEmail = require('../services/email-otp');
const couponHelpers = require('../helpers/couponHelpers');
const orderHelpers = require('../helpers/orderhelpers');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const apis = {
  login: process.env.ADMIN_LOGIN_API,
  otp: process.env.ADMIN_OTP_API,
};
// eslint-disable-next-line require-jsdoc
function updateCategory(id, details, res) {
  categoryHelpers.updateCategory(id, details).then((doc)=> {
    if (doc.error) {
      res.json({error: doc.error});
    } else {
      res.json({success: true, image: doc.image,
        id: doc.id, date: doc.updatedAt, by: doc.lastEditedBy});
    }
  }).catch((err) => {
    res.json({error: err.message});
  });
}
async function deleteDirectory(directory) {
  try {
    const folders = await readdirPromised(directory);
    for (const folder of folders) {
      const files = await readdirPromised(path.join(directory, folder));
      for (const file of files) {
        await unlinkPromised(path.join(directory, folder, file));
      }
      await rmdirPromised(path.join(directory, folder));
    }
    await rmdirPromised(directory);
  } catch (err) {
    console.error(err);
  }
}

const readdirPromised = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
};

const unlinkPromised = (file) => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

const rmdirPromised = (dir) => {
  return new Promise((resolve, reject) => {
    fs.rmdir(dir, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = {
  getLogin: (req, res, next) => {
    res.render('admins/admin-login', apis);
  },

  DoLogin: (req, res, next) => {
    const {email, password} = req.body;
    adminHelpers.checkEmailExist(email).then(async (admin)=>{
      if (admin) {
        const result = await bcrypt.compare(password, admin.hashPassword);
        if (result) {
          req.session.admin = admin;
          sendEmail.sendOtp(email).then((otp)=>{
            req.session.adminOtp = otp;
            console.log('admin otp ', otp);
            res.json({success: true});
          }).catch((err)=>{
            res.json({otp: true});
          });
        } else {
          res.json({admin: true});
        }
      } else {
        res.json({success: false});
      }
    });
  },
  verifyOtp: (req, res, next)=>{
    if (req.body.otp == req.session.adminOtp) {
      delete req.session.adminOtp;
      req.session.adminLoggedIn = true;
      res.json({success: true});
    } else {
      res.json({success: false});
    }
  },
  resendOtp: (req, res, next)=>{
    sendEmail.resendOtp(req.session.admin.email).then((otp)=>{
      req.session.admin.otp = otp;
      res.json({success: true});
    }).catch((err)=>{
      res.json({success: false});
    });
  },
  DoLogout: (req, res, next)=>{
    delete req.session.adminLoggedIn;
    delete req.session.admin;
    res.redirect('/admin');
  },
  getHome: async (req, res, next)=>{
    try {
      let recentOrders = await orderHelpers.getLimitedOrders();
      let todaySale = await orderHelpers.todaySale();
      let totalSale = await orderHelpers.totalSale();
      if (todaySale.length === 0) {
        todaySale = [{todaySales: 0, todayRevenue: 0}];
      }

      if (totalSale.length === 0) {
        totalSale = [{totalSales: 0, totalRevenue: 0}];
      };

      if (recentOrders.length === 0) {
        recentOrders = [];
      };

      res.render('admins/admin-home',
          {admin: req.session.admin,
            todaySale, totalSale, recentOrders});
    } catch (error) {
      next(error);
    }
  },
  salesAndRevenue: async (req, res, next) => {
    try {
      const sales = await orderHelpers.salesAndRevenueChart();
      const size = await orderHelpers.sizeAndSaleReport();
      console.log(size);
      res.json({success: true, sales, size});
    } catch (error) {
      next(error);
    }
  },
  addAdmin: async (req, res, next)=>{
    await adminHelpers.addAdmin(req.body);
    res.json({success: true});
  },
  blockUser: (req, res, next)=>{
    blockUser(req.body.id).then((response)=>{
      if (response) {
        res.json({success: true});
      } else {
        res.json({succcess: false});
      }
    }).catch((err)=>{
      res.json({error: err.message});
    });
  },
  unblockUser: (req, res, next)=>{
    unblockUser(req.body.id).then((response)=>{
      res.json({success: true});
    }).catch((err)=>{
      res.json({succcess: false});
    });
  },
  getUsers: (req, res, next)=>{
    getAllUsers().then((users)=>{
      res.json(users);
    }).catch((err)=>{
      res.json({succcess: false});
    });
  },
  getCsrf: (req, res, next)=>{
    const csrfToken = req.csrfToken();
    req.session.adminCsrf = csrfToken;
    res.json(csrfToken);
  },
  addCategory: (req, res)=>{
    const {name, description} = req.body;
    if (name == '' || description == '') {
      res.json({message: 'All fields are required'});
    } else {
      categoryHelpers.checkCategoryExists(name).then(()=>{
        req.session.addCategory = {name: name, description: description};
        res.json({success: true});
      }).catch(()=>{
        res.json({message: 'Category name already exists, Should be unique.'});
      });
    };
  },
  addCatImage: (req, res, next)=>{
    if (!req.file) {
      return res.status(404).json({error: 'Image is required'});
    }
    const addCategory = req.session.addCategory;
    addCategory.image = req.file.filename;
    addCategory.lastEditedBy = req.session.admin.firstName;
    fs.mkdir(path.join(__dirname, `../public/uploads/${addCategory.name}`),
        (error)=> {
          if (error) {
            console.log(error);
            res.json({success: false});
          } else {
            categoryHelpers.addCategory(addCategory).then((doc)=>{
              delete req.session.addCategory;
              res.json({success: true, doc});
            }).catch((err)=>{
              console.log(err);
              res.json({success: false});
            });
          }
        });
  },
  getCategories: (req, res) => {
    categoryHelpers.getAllCategories().then((category)=> {
      res.json(category);
    }).catch((err)=>{
      res.json({error: err.message});
    });
  },
  deleteCategory: (req, res) => {
    categoryHelpers.deleteCategory(req.body.id).then((data)=>{
      designHelpers.deleteDesigns(data.name).then(()=> {
        fs.unlink('public/uploads/category/'+data.image, (error)=> {
          if (error) {
            console.log(error);
          } else console.log('file deleted');
        });
        const directory =
         path.join(__dirname, '../public', 'uploads', data.name);
        deleteDirectory(directory);
        res.json({success: true});
      }).catch((err) => res.json({error: err.message}));
    }).catch((error)=>{
      res.json({error: error.message});
    });
  },
  deactivateCategory: (req, res) => {
    categoryHelpers.deactivateCategory(req.body.id).then((doc)=> {
      if (doc.error) {
        res.json({error: doc.error});
      } else {
        res.json({success: true, date: doc.updatedAt, by: doc.lastEditedBy});
      }
    }).catch((err) => {
      res.json({error: err.message});
    });
  },
  activateCategory: (req, res) => {
    categoryHelpers.activateCategory(req.body.id).then((doc)=> {
      if (doc.error) {
        res.json({error: doc.error});
      } else {
        res.json({success: true, date: doc.updatedAt, by: doc.lastEditedBy});
      }
    }).catch((err) => {
      res.json({error: err.message});
    });
  },
  getCategoryDetails: (req, res) => {
    categoryHelpers.getCategoryDetails(req.body.id).then((category)=> {
      if (category.error) {
        res.json({error: category.error});
      } else {
        res.json({success: true, category: category});
      };
    }).catch((err)=>{
      res.json({error: err.message});
    });
  },
  updateCategory: (req, res) => {
    const {name, description, id} = req.body;
    const details = {description: description};
    categoryHelpers.checkCategoryExistsById(id).then((oldName) => {
      if (oldName.error) {
        res.json({error: oldName.error});
      } else {
        if (oldName !== name) {
          details.name = name;
          const oldPath =
           path.join(__dirname, '../public', 'uploads', oldName);
          const newPath =
           path.join(__dirname, '../public', 'uploads', name);

          fs.rename(oldPath, newPath, (err) => {
            if (err) {
              console.log(err);
              res.json({error:
                 'There is trouble in upadating category name now'});
            } else {
              categoryHelpers.checkCategoryExists(name).then(() => {
                updateCategory(id, details, res);
              }).catch(()=> {
                res.json({error:
                   'Category name is already in use , should be unique'});
              });
              console.log(`Directory renamed from ${oldName} to ${name}.`);
            }
          });
        } else {
          updateCategory(id, details, res);
        };
      };
    });
  },
  categoryImageUpdate: (req, res) => {
    const {id, image} = req.body;
    fs.unlink('public/uploads/category/'+image, (err)=> {
      if (err) {
        console.log(err);
      } else console.log('file update deleted');
    });
    categoryHelpers.updateCategoryImage(id, req.file.filename).then((doc)=>{
      if (doc.error) {
        res.json({error: doc.error});
      } else {
        res.json({success: true, newImage: doc.image});
      }
    }).catch((err)=>{
      res.json({error: err.message});
    });
  },
  getCategoryNames: (req, res)=> {
    categoryHelpers.getCategoryNames().then((category)=> {
      res.json({success: true, categories: category});
    }).catch((err)=>{
      res.json({error: err.message});
    });
  },
  getDesignCategory: (req, res) => {
    designHelpers.getDesigns().then((doc)=> {
      res.render('admins/admin-design',
          {admin: req.session.admin, category: doc});
    });
  },
  getAddDesignCategory: (req, res) => {
    categoryHelpers.getCategoryNames().then((category)=> {
      res.render('admins/add-design', {category: category});
    });
  },
  AddDesignCategory: (req, res) => {
    const {designCode, gender, sizes, colors, expectedPrice,
      stock, category} = req.body;
    const details = {
      designCode: designCode,
      gender: gender,
      sizes: sizes,
      colors: colors,
      expectedPrice: expectedPrice,
      stock: stock,
      category: category,
      image: req.file.filename,
      lastEditedBy: req.session.admin.firstName,
    };
    const dir = path.join(__dirname,
        '../public', 'uploads', category, designCode);
    fs.mkdir(dir, (err) => {
      if (err) {
        console.log(err);
      } else {
        designHelpers.addDesign(details).then((doc)=> {
          res.redirect('/admin/design/category');
        });
      }
    });
  },
  checkCodeExists: (req, res)=> {
    designHelpers.checkCodeExists(req.body.code).then((doc)=> {
      if (doc) {
        res.json({});
      } else res.json({success: true});
    });
  },
  getProductsPage: (req, res) => {
    productHelpers.getProducts().then((products)=> {
      res.render('admins/admin-products', {admin: req.session.admin,
        products: products});
    }).catch((err)=> {
      console.log(err);
    });
  },
  getDesignCodes: (req, res) => {
    designHelpers.getDesignCodes().then((doc)=> {
      res.json({success: true, codes: doc});
    });
  },
  addProductName: (req, res) => {
    const {name, designCode} = req.body;
    req.session.addProduct = {
      name: name,
      designCode: designCode,
    };
    res.json({success: true});
  },
  getAddProductPage: (req, res) => {
    const {name, designCode} = req.session.addProduct;
    designHelpers.checkCodeExists(designCode).then((doc)=>{
      res.render('admins/admin-add-product', {name: name, doc});
    });
  },
  addProductAll: (req, res)=> {
    const {name, designCode, gender, sizes, exactColor, broadColor, price,
      stock, category} = req.body;
    const newSizes = sizes.map((size)=> {
      return {size: size,
        stock: req.body[`stockOf${size}`],
      };
    });
    const imageArray = Object.values(req.files).map((file) => file.filename);
    const details = {
      name: name,
      designCode: designCode,
      gender: gender,
      sizes: newSizes,
      exactColor: exactColor,
      broadColor: broadColor,
      stock: stock,
      category: category,
      price: price,
      images: imageArray,
      lastEditedBy: req.session.admin.firstName,
    };
    productHelpers.addProduct(details).then((doc)=>{
      res.json({success: true});
    }).catch((err)=> res.json({error: err.message}));
  },
  getCouponsPage: (req, res) => {
    couponHelpers.getCoupons().then((coupons)=> {
      res.render('admins/admin-coupons', {admin: req.session.admin, coupons});
    });
  },
  createCoupon: (req, res)=> {
    req.body.lastEditedBy = req.session.admin.firstName;
    couponHelpers.addCoupon(req.body).then(()=> {
      res.json({success: true});
    });
  },
  getOrdersPage: async (req, res)=> {
    const orders = await orderHelpers.getAllOrders();
    res.render('admins/admin-orders', {admin: req.session.admin,
      page: 'orders', orders});
  },
  getOrderDetails: async (req, res)=> {
    const order = await orderHelpers.getOneOrderAdmin(req.body.id);
    if (order) {
      return res.json({success: true, order});
    }
    return res.json({success: false});
  },
  getOrderDetailsPage: async (req, res)=> {
    const order = await orderHelpers.getOneOrderAdmin(req.params.id);
    if (order) {
      res.render('admins/view-order', {admin: req.session.admin,
        order: order});
    }
  },
  changeOrderStatus: (req, res)=> {
    const {id, status} = req.body;
    orderHelpers.changeOrderStatus(id, status).then(()=> {
      res.json({success: true});
    });
  },
  getBannersPage: async (req, res) => {
    const banners = await bannerHelpers.getBanners();
    res.render('admins/banners.ejs',
        {admin: req.session.admin, banners});
  },
  getEditBannersPage: async (req, res) => {
    const banner = await bannerHelpers.getBanner(req.params.name);
    res.render('admins/edit-banner', {admin: req.session.admin, banner});
  },
  updateBanners: async (req, res)=> {
    req.body.image = req.file.filename;
    const {id, ...details} = req.body;
    await bannerHelpers.updateBanner(id, details);
    res.redirect('/admin/banners');
  },
  checkNameExists: async (req, res)=> {
    const banner = await bannerHelpers.getBanner(req.params.name);
    if (banner) {
      return res.json({exists: true});
    }
    return res.json({exists: false});
  },
  changeProductCODStatus: async (req, res, next)=> {
    try {
      const status = await productHelpers.changeProductCODStatus(req.body.id);
      res.json({success: true, status});
    } catch (error) {
      next(error);
    }
  },
  changeProductActiveStatus: (req, res, next)=> {
    productHelpers.changeProductActiveStatus(req.body.id)
        .then((status)=> res.json({success: true, status}))
        .catch((error)=> next(error));
  },
  getEditProductPage: (req, res, next)=> {
    productHelpers.getProductDetails(req.params.id).then((product)=> {
      res.render('admins/edit-product', {product});
    }).catch((error)=> next(error));
  },
  updateProduct: (req, res, next)=> {
    const {name, id, designCode, gender, sizes, exactColor, broadColor, price,
      stock, category} = req.body;
    const newSizes = sizes.map((size)=> {
      return {size: size,
        stock: req.body[`stockOf${size}`],
      };
    });
    const imageArray = Object.values(req.files).map((file) => file.filename);
    const details = {
      name: name,
      designCode: designCode,
      gender: gender,
      sizes: newSizes,
      exactColor: exactColor,
      broadColor: broadColor,
      stock: stock,
      category: category,
      price: price,
      lastEditedBy: req.session.admin.firstName,
    };
    productHelpers.updateProduct(id, details, imageArray).then(()=> {
      res.json({success: true});
    }).catch((err)=> next(err));
  },
};
