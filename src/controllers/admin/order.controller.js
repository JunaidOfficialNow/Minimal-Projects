const fs = require('fs');
const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

const OrderServices = require('../../services/order.services');

exports.getOrdersPage = catchAsync(async (req, res, next)=> {
  const orders = await OrderServices.getAllOrders();
  res.render('admins/admin-orders', {
    admin: req.session.admin,
    page: 'orders',
    orders,
  });
});

exports.getOrderDetails = catchAsync(async (req, res, next)=> {
  const order = await OrderServices.getOrderById(req.body.id);
  return res.json({success: true, order});
});

exports.getOrderDetailsPage = catchAsync(async (req, res, next)=> {
  const order = await OrderServices.getOrderById(req.params.id);
  res.render('admins/view-order', {
    admin: req.session.admin,
    order,
  });
});

exports.changeOrderStatus = catchAsync(async (req, res, next)=> {
  const {id, status} = req.body;
  await OrderServices.changeOrderStatus(id, status);
  res.json({success: true});
});

exports.downloadOrdersReport = catchAsync(async (req, res, next)=> {
  const path = await OrderServices.getOrderReportCSV(req.params.status);
  res.download(path, () => {
    fs.unlink(path, (err) => {
      if (err) next(err);
    });
  });
});
