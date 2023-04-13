/* eslint-disable require-jsdoc */
const categoryHelpers = require('../helpers/categoryHelpers');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Design = require('../models/designModel');
const Category = require('../models/categoryModel');
const orderHelpers = require('../helpers/orderHelpers');
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');
const User = require('../models/userModel');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
// eslint-disable-next-line require-jsdoc
function updateCategory(id, details, res, next) {
  Category.findByIdAndUpdate(id, details, {new: true}).then((doc)=> {
    if (doc) {
      return res.json({success: true, image: doc.image,
        id: doc.id, date: doc.updatedAt, by: doc.lastEditedBy});
    }
    throw new Error('Category may have deleted');
  }).catch((err)=> {
    next(err);
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
  getHome: async (req, res, next)=>{
    try {
      let recentOrders = await Order.find({}).populate({
        path: 'userId',
        model: User,
      }).sort({createdAt: -1}).limit(5);
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
      res.json({success: true, sales, size});
    } catch (error) {
      next(error);
    }
  },
  blockUser: async (req, res, next)=>{
    User.findByIdAndUpdate(req.body.id, {isBlocked: true}).then((response)=> {
      if (response) {
        res.json({success: true});
      } else {
        res.json({succcess: false});
      }
    }).catch((error)=> next(error));
  },
  unblockUser: (req, res, next)=>{
    User.findByIdAndUpdate(req.body.id, {isBlocked: false}).then((response)=>{
      res.json({success: true});
    }).catch((err)=>{
      next(err);
    });
  },
  getUsers: (req, res, next)=>{
    User.find().then((users)=>{
      res.json(users);
    }).catch((err)=>{
      next(err);
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
    // eslint-disable-next-line max-len
    fs.mkdir(path.join(__dirname, `../public/static/uploads/${addCategory.name}`),
        (error)=> {
          if (error) {
            res.json({success: false});
          } else {
            Category.create(addCategory).then((doc)=>{
              delete req.session.addCategory;
              res.json({success: true, doc});
            }).catch((err)=>{
              res.json({success: false});
            });
          }
        });
  },
  getCategories: (req, res, next) => {
    Category.find({}).then((category)=> {
      res.json(category);
    }).catch((err)=>{
      next(err);
    });
  },
  deleteCategory: (req, res) => {
    Category.findByIdAndRemove(req.body.id).then((data)=>{
      Design.deleteMany({category: data.name}).then(()=> {
        fs.unlink('public/uploads/category/'+data.image, (error)=> {
          if (error) {
          }
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
  deactivateCategory: (req, res, next) => {
    Category.findByIdAndUpdate(req.body.id, {isActive: false},
        {new: true}).then((doc)=>{
      if (doc) {
        res.json({success: true, date: doc.updatedAt, by: doc.lastEditedBy});
      } else {
        throw new Error('Category may have already deleted');
      };
    }).catch((err) => {
      next(err);
    });
  },
  activateCategory: (req, res, next) => {
    Category.findByIdAndUpdate(req.body.id, {isActive: true},
        {new: true}).then((doc)=>{
      if (doc) {
        res.json({success: true, date: doc.updatedAt, by: doc.lastEditedBy});
      } else {
        throw new Error('Category may have already deleted');
      };
    }).catch((err) => {
      next(err);
    });
  },
  getCategoryDetails: (req, res, next) => {
    Category.findById(req.body.id).then((doc)=> {
      if (doc) {
        return res.json({success: true, category: doc});
      }
      throw new Error('Category may have deleted');
    }).catch((err)=>{
      next(err);
    });
  },
  updateCategory: (req, res, next) => {
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
              res.json({error:
                 'There is trouble in upadating category name now'});
            } else {
              categoryHelpers.checkCategoryExists(name).then(() => {
                updateCategory(id, details, res, next);
              }).catch(()=> {
                res.json({error:
                   'Category name is already in use , should be unique'});
              });
            }
          });
        } else {
          updateCategory(id, details, res, next);
        };
      };
    });
  },
  categoryImageUpdate: (req, res, next) => {
    const {id, image} = req.body;
    fs.unlink('public/uploads/category/'+image, (err)=> {
      if (err) {
      }
    });
    Category.findByIdAndUpdate(id, {image: req.file.filename},
        {new: true}).then((doc)=> {
      if (doc) {
        res.json({success: true, newImage: doc.image});
      }
      throw new Error('Category may have already deleted');
    }).catch((err)=>{
      next(err);
    });
  },
  getCategoryNames: (req, res, next)=> {
    Category.find({}).select('name -_id').then((category)=> {
      res.json({success: true, categories: category});
    }).catch((err)=>{
      next(err);
    });
  },
  getDesignCategory: async (req, res) => {
    const category = await Design.find({});
    res.render('admins/admin-design',
        {admin: req.session.admin, category});
  },
  getAddDesignCategory: (req, res) => {
    Category.find({}).select('name -_id').then((category)=> {
      res.render('admins/add-design', {category: category});
    });
  },
  AddDesignCategory: async (req, res, next) => {
    try {
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
          '../public', 'static', 'uploads', category, designCode);
      fs.mkdir(dir, async (err) => {
        if (err) {
        } else {
          await Design.create(details);
          res.redirect('/admin/design/category');
        }
      });
    } catch (error) {
      next(error);
    }
  },
  checkCodeExists: (req, res, next)=> {
    Design.findOne({designCode: req.body.code}).then((doc)=> {
      if (doc) {
        res.json({});
      } else res.json({success: true});
    }).catch((err)=> next(err));
  },
  getProductsPage: (req, res, next) => {
    Product.find().then((products)=> {
      res.render('admins/admin-products', {admin: req.session.admin,
        products: products});
    }).catch((err)=> next(err));
  },
  getDesignCodes: (req, res, next) => {
    Design.distinct('designCode').then((doc)=> {
      res.json({success: true, codes: doc});
    }).catch((err)=> next(err));
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
    Design.findOne({designCode}).then((doc)=>{
      res.render('admins/admin-add-product', {name: name, doc});
    });
  },
  addProductAll: async (req, res, next)=> {
    try {
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
      const product = new Product(details);
      await product.save();
      res.json({success: true});
    } catch (error) {
      next(error);
    }
  },
  getCouponsPage: (req, res, next) => {
    Coupon.find().then((coupons)=> {
      res.render('admins/admin-coupons', {admin: req.session.admin, coupons});
    }).catch((error)=> {
      next(error);
    });
  },
  createCoupon: (req, res, next)=> {
    req.body.lastEditedBy = req.session.admin.firstName;
    Coupon.create(req.body).then(()=> {
      res.json({success: true});
    }).catch((error)=> {
      next(error);
    });
  },
  getOrdersPage: async (req, res)=> {
    try {
      const orders = await Order.find({}).populate({
        path: 'products.product',
        model: Product,
      }).populate({
        path: 'userId',
        model: User,
      }).sort({createdAt: -1});
      res.render('admins/admin-orders', {admin: req.session.admin,
        page: 'orders', orders});
    } catch (error) {
      next(error);
    }
  },
  getOrderDetails: async (req, res, next)=> {
    try {
      const order = await Order.findById(req.body.id).populate({
        path: 'products.product',
        model: Product,
      }).populate({
        path: 'userId',
        model: User,
      });
      if (order) {
        return res.json({success: true, order});
      }
      return res.json({success: false});
    } catch (error) {
      next(error);
    }
  },
  getOrderDetailsPage: async (req, res, next)=> {
    try {
      const order = await Order.findById(req.params.id).populate({
        path: 'products.product',
        model: Product,
      }).populate({
        path: 'userId',
        model: User,
      });
      if (order) {
        res.render('admins/view-order', {admin: req.session.admin,
          order: order});
      }
    } catch (error) {
      next(error);
    }
  },
  changeOrderStatus: (req, res)=> {
    const {id, status} = req.body;
    Order.findByIdAndUpdate(id, {status: status}).then(()=> {
      res.json({success: true});
    }).catch((err)=> {
      next(err);
    });
  },
  getBannersPage: async (req, res) => {
    const banners = await Banner.find();
    res.render('admins/banners.ejs',
        {admin: req.session.admin, banners});
  },
  getEditBannersPage: async (req, res) => {
    const banner = await Banner.findOne({name: req.params.name});
    res.render('admins/edit-banner', {admin: req.session.admin, banner});
  },
  updateBanners: async (req, res, next)=> {
    try {
      if (req.file) {
        req.body.image = req.file.filename;
      }
      const {id, ...details} = req.body;
      await Banner.findByIdAndUpdate(id, details);
      res.redirect('/admin/banners');
    } catch (error) {
      next(error);
    }
  },
  checkNameExists: async (req, res)=> {
    const banner = await Banner.findOne({name: req.params.name});
    if (banner) {
      return res.json({exists: true});
    }
    return res.json({exists: false});
  },
  changeProductCODStatus: async (req, res, next)=> {
    try {
      const product = await Product.findById(req.body.id);
      if (product) {
        product.isCodAvailable = !product.isCodAvailable;
        const newProduct = await product.save();
        res.json({success: true, status: newProduct.isCodAvailable});
      } else {
        throw new Error('Couldn\'t find product');
      }
    } catch (error) {
      next(error);
    }
  },
  changeProductActiveStatus: async (req, res, next)=> {
    try {
      const product = await Product.findById(req.body.id);
      product.isActive = !product.isActive;
      const newProduct = await product.save();
      res.json({success: true, status: newProduct.isActive});
    } catch (error) {
      next(error);
    };
  },
  getEditProductPage: (req, res, next)=> {
    Product.findById(req.params.id).then((product)=> {
      res.render('admins/edit-product', {product});
    }).catch((error)=> next(error));
  },
  updateProduct: async (req, res, next)=> {
    try {
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
      const product = await Product.findByIdAndUpdate(id, details, {new: true});
      imageArray.forEach((image)=> {
        product.images.push(image);
      });
      await product.save();
      res.json({success: true});
    } catch (error) {
      next(error);
    }
  },
  downloadSalesReport: async (req, res, next)=> {
    try {
      const orders = await Order.find({status: req.params.status});
      if (orders.length > 0) {
        const csvWriter = createCsvWriter({
          path: 'orders.csv',
          header: [
            {id: 'orderId', title: 'Order ID'},
            {id: 'userId', title: 'Customer ID'},
            {id: 'status', title: 'Status'},
            {id: 'paymentMethod', title: 'payment'},
            {id: 'coupon', title: 'Coupon'},
            {id: 'discount', title: 'dicount'},
            {id: 'subTotal', title: 'Sub Total'},
            {id: 'totalAmount', title: 'Total Amount'},
          ],
        });
        await csvWriter.writeRecords(orders);
        res.download('orders.csv', () => {
          fs.unlink('orders.csv', (err) => {
            if (err) next(err);
          });
        });
      } else {
        throw new Error('No records to download');
      };
    } catch (error) {
      next(error);
    }
  },
  changeDesignStatus: async (req, res, next)=> {
    try {
      const design = await Design.findById(req.body.id);
      let status;
      if (design) {
        design.isActive = !design.isActive;
        const newDesign = await design.save();
        status = {status: newDesign.isActive,
          code: newDesign.designCode};
      } else {
        throw new Error('No design document found');
      }
      await Product.updateMany(
          {designCode: status.code},
          {$set: {isActive: status.status}},
      );
      res.json({success: true, status: status.status});
    } catch (error) {
      next(error);
    };
  },
  changeCouponStatus: async (req, res, next)=> {
    try {
      const coupon = await Coupon.findById(req.body.id);
      if (coupon) {
        coupon.isActive = !coupon.isActive;
        const newCoupon = await coupon.save();
        return res.json({success: true, status: newCoupon.isActive});
      }
      new Error('Coupon not found');
    } catch (error) {
      next(error);
    };
  },
  getCoupon: async (req, res, next)=> {
    try {
      const coupon = await Coupon.findById(req.params.id);
      res.json({success: true, coupon});
    } catch (error) {
      next(error);
    }
  },
  updateCoupons: async (req, res, next)=> {
    try {
      const {id, ...details} = req.body;
      await Coupon.findByIdAndUpdate(id, details);
      res.json({success: true});
    } catch (error) {
      next(error);
    }
  },
};
