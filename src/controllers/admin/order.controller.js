const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const orderRepo = require('../../repositories/order.repository');

exports.getOrdersPage = async (req, res, next)=> {
  try {
    const orders = await orderRepo.getAllorders();
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
    const order = await orderRepo.getOrderById(req.body.id);
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
    const order = await orderRepo.getOrderById(req.params.id);
    if (order) {
      res.render('admins/view-order', {admin: req.session.admin,
        order: order});
    }
  } catch (error) {
    next(error);
  }
};

exports.changeOrderStatus = (req, res, next)=> {
  const {id, status} = req.body;
  orderRepo.changeOrderStatus(id, status).then(()=> {
    res.json({success: true});
  }).catch((err)=> {
    next(err);
  });
};

exports.downloadOrdersReport = async (req, res, next)=> {
  try {
    const orders = orderRepo.getOrdersByStatus(req.params.status);
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
};


