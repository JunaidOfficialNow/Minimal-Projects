/* eslint-disable require-jsdoc */
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Design = require('../models/designModel');
const orderHelpers = require('../helpers/orderHelpers');
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');
const User = require('../models/userModel');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

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
  getCsrf: (req, res, next)=>{
    const csrfToken = req.csrfToken();
    req.session.adminCsrf = csrfToken;
    res.json(csrfToken);
  },
  getProductsPage: (req, res, next) => {
    Product.find().then((products)=> {
      res.render('admins/admin-products', {admin: req.session.admin,
        products: products});
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
