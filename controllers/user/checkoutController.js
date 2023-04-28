const Address = require('../../models/addressModel');
const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');
const Coupon = require('../../models/couponModel');
const Order = require('../../models/orderModel');

const crypto = require('crypto');
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.RAZ_KEY_ID,
  key_secret: process.env.RAZ_SECRET_KEY,
});

exports.getCheckout = async (req, res, next) => {
  try {
    if (req.session.checkOutToken === req.params.token) {
      const user = req.session.user;
      const address = await Address.findById(user._id);
      const cart = await Cart.findById(user._id).populate({
        path: 'products._id',
        model: Product,
      });
      res.render('users/user-checkout', {
        user,
        page: 'checkout',
        address: address?.addresses[0],
        products: cart?.products ?? [],
      });
    } else {
      res.redirect('/cart');
    }
  } catch (error) {
    next(error);
  }
};

// needs to reduce this  function
exports.placeOrder = async (req, res, next) =>{
  try {
    const {
      coupon,
      subTotal,
      discount,
      total,
      method,
      ...address
    } = req.body;


    if (method === 'COD') {
      const customerName = req.session.user.firstName;
      // needs to test the output of the  orderId
      req.session.orderId = `
      ${customerName.charAt(0).toUpperCase()}
      ${Date.now()}
      ${Math.floor(Math.random() * 1000)}
      `;
    }

    if (coupon !== 'No coupon applied') {
      await Coupon.updateOne(
          {couponCode: coupon},
          {$inc: {usageLimit: -1}},
      );
    }

    const cart = await Cart.findById(req.session.user._id).populate({
      path: 'products._id',
      model: Product,
    });

    const products= cart?.products ?? [];
    // clearing cart items
    if (cart) {
      cart.products = [];
      await cart.save();
    }

    const details = {
      orderId: req.session.orderId,
      userId: req.session.user._id,
      billingAddress: address,
      paymentMethod: method,
      totalAmount: total,
      subTotal,
      discount,
      coupon,
      products: products.map((item) => ({
        product: item?._id?._id,
        quantity: item?.quantity,
        size: item?.size,
        price: Number(item?._id?.price),
      })),
    };


    details.products.forEach(async (item)=> {
      const {product, quantity, size} = item;
      const filter = {_id: product};
      const update = {$inc: {
        'stock': -(Number(quantity)),
        'sizes.$[elem].stock': -(Number(quantity)),
      }};
      const options = {arrayFilters: [{'elem.size': size}]};
      await Product.updateOne( filter, update, options);
    });

    await Order.create(details);
    await User.findByIdAndUpdate(req.session.user._id, {$set: {cartCount: 0}});
    req.session.user.cartCount = 0;
    res.redirect(`/order/success/${req.session.orderId}`);
  } catch (error) {
    next(error);
  };
};

exports.applyCoupon = async (req, res) => {
  const {coupon, total} = req.body;
  try {
    const couponData = await Coupon.findOne({couponCode: coupon});
    if (!couponData) {
      return res.json({success: false});
    }
    const {
      isActive,
      expirationDate,
      purchaseAmount,
      usageLimit,
      discountPercentage,
      offerUpto,
      couponCode,
    } = couponData;
    if (!isActive) {
      return res.json({success: true, valid: true});
    }
    const now = new Date();
    if (expirationDate <= now) {
      return res.json({success: true, expire: true});
    }
    if (purchaseAmount > Number(total)) {
      return res.json({success: true, amount: true});
    }
    if (usageLimit <= 0) {
      return res.json({success: true, usage: true});
    }
    // eslint-disable-next-line max-len
    const discount = Math.min(Number(total) * (discountPercentage / 100), offerUpto);

    const cart = await Cart.findById(req.session.user._id);
    if (cart) {
      cart.coupon = couponCode;
      cart.discount = discount;
      await cart.save();
    }
    return res.json({success: true, discount, couponCode});
  } catch (err) {
    next(err);
  }
};


exports.initiatePaymentOnline = (req, res, next)=> {
  try {
    const customerName = req.session.user.firstName;

    const orderId =
    customerName.charAt(0)
        .toUpperCase() + Date.now()
        .toString() + Math.floor(Math.random() * 1000).toString();

    const {total} = req.body;

    instance.orders.create({
      amount: Number(total)*100,
      currency: 'INR',
      receipt: orderId,
    }).then((order)=> {
      res.json({success: true, order});
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = (req, res)=> {
  try {
    const details = req.body;

    let hmac = crypto.createHmac('sha256', process.env.RAZ_SECRET_KEY);
    // eslint-disable-next-line max-len
    hmac.update(details.payment.razorpay_order_id +'|'+details.payment.razorpay_payment_id);
    hmac =hmac.digest('hex');

    if (hmac==details.payment.razorpay_signature) {
      req.session.orderId = details.order.receipt;
      return res.json({success: true});
    }

    return res.json({success: false});
  } catch (error) {
    console.error(error);
  }
};

exports.getSuccessOrder = async (req, res, next)=> {
  try {
    if (req.session.orderId === req.params.orderId) {
      delete req.session.orderId;
      const order =
         await Order.findOne({orderId: req.params.orderId}).populate({
           path: 'products.product',
           model: Product,
         });

      if (order) {
        res.render('users/order-success', {user: req.session.user,
          order: order,
          page: 'order-success'});
      }
    } else {
      res.redirect('/');
    }
  } catch (error) {
    next(error);
  }
};

// need to verify the place of this  function
exports.verifyStock = async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.session.user._id).populate({
      path: 'products._id',
      model: Product,
    });

    const products = cart?.products ?? [];
    const results = await Promise.all(products.map(async (product) => {
      const productEach = await Product.findById(product._id._id);
      let stock = 0;
      if (productEach) {
        const matchingSize =
        productEach.sizes.find((size) => size.size === product.size);
        if (matchingSize) {
          stock = matchingSize.stock;
        }
      }
      if (Number(stock) < Number(product.quantity)) {
        return product._id.name;
      } else {
        return null;
      }
    }));

    const insufficientProducts = results.filter((result) => result !== null);

    if (insufficientProducts.length > 0) {
      return res.json({success: false, products: insufficientProducts});
    }
    return res.json({success: true});
  } catch (error) {
    next(error);
  }
};


