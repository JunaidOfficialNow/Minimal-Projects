const fs = require('fs');
const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

const OrderServices = require('../../services/order.services');

exports.getOrdersPage = async (req, res, next)=> {
  try {
    const orders = await OrderServices.getAllOrders();
    res.render('admins/admin-orders', {
      admin: req.session.admin,
      page: 'orders',
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetails = async (req, res, next)=> {
  try {
    const order = await OrderServices.getOrderById(req.body.id);
    if (order) {
      return res.json({success: true, order});
    }
    return res.json({success: false});
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetailsPage = async (req, res, next)=> {
  try {
    const order = await OrderServices.getOrderById(req.params.id);
    if (order) {
      res.render('admins/view-order', {
        admin: req.session.admin,
        order,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.changeOrderStatus = (req, res, next)=> {
  const {id, status} = req.body;
  OrderServices.changeOrderStatus(id, status).then(()=> {
    res.json({success: true});
  }).catch((err)=> {
    next(err);
  });
};

exports.downloadOrdersReport = catchAsync(async (req, res, next)=> {
  const orders = await OrderServices.getOrdersByStatus(req.params.status);
  if (orders.length > 0) {
    const path = await OrderServices.getOrderReportCSV(orders);
    res.download(path, () => {
      fs.unlink(path, (err) => {
        if (err) next(err);
      });
    });
  } else {
    throw new Error('No records to download');
  };
});


