/* eslint-disable require-jsdoc */
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const orderHelpers = require('../helpers/orderHelpers');
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
};
