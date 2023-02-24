const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../services/email-otp');
const userHelpers = require('../helpers/userHelpers');
const productHelpers = require('../helpers/productHelpers');
const designHelpers = require('../helpers/designHelpers');
const addressHelpers = require('../helpers/addressHelpers');
const categoryHelpers = require('../helpers/categoryHelpers');
const cartHelpers = require('../helpers/cartHelpers');
const couponHelpers = require('../helpers/couponHelpers');
const orderHelpers = require('../helpers/orderHelpers');
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.RAZ_KEY_ID,
  key_secret: process.env.RAZ_SECRET_KEY,
});


module.exports = {
  getLoginPage: (req, res)=>{
    res.render('users/user-login');
  },
  handleEmail: (req, res)=>{
    const email = req.body.email;
    userHelpers.checkEmailExist(email).then((user)=>{
      if (user) {
        res.json({user: true});
      } else {
        sendEmail.sendOtp(email).then((otp)=>{
          console.log(otp);
          req.session.userDetails = {
            email: email,
            otp: otp,
          };
          res.json({success: true});
        }).catch((err)=>{
          console.log(err);
          res.json({success: false});
        });
      };
    });
  },
  handleOtp: (req, res)=>{
    if (req.body.otp == req.session.userDetails.otp) {
      delete req.session.userDetails.otp;
      res.json({success: true});
    } else {
      res.json({success: false});
    };
  },
  handleNames: (req, res, next)=>{
    const lastName = req.body.lastName;
    req.session.userDetails.firstName = req.body.firstName;
    req.session.userDetails.lastName = lastName;
    if (lastName.length > 0) {
      req.session.userDetails.isLastNameAdded = true;
    }
    res.json({});
  },
  handlePassword: async (req, res, next)=>{
    const pass = await bcrypt.hash(req.body.password, 10);
    const userDetails = req.session.userDetails;
    userDetails.hashPassword = pass;
    userHelpers.addUser(userDetails).then((user)=>{
      delete req.session.userDetails;
      req.session.user = user;
      res.json({success: true});
    }).catch((err)=>{
      console.log(err);
      res.json({success: false});
    });
  },
  handleResendOtp: (req, res, next)=>{
    sendEmail.resendOtp(req.session.userDetails.email).then((otp)=>{
      console.log(otp);
      req.session.userDetails.otp = otp;
      res.json({success: true});
    }).catch((err)=>{
      res.json({success: false});
    });
  },
  DoLogin: (req, res, next)=>{
    const {email, password} = req.body;
    userHelpers.checkEmailExist(email).then(async (user)=>{
      if (user) {
        if (user.isBlocked) {
          res.json({blocked: true});
        } else {
          const passMatch = await bcrypt.compare(password, user.hashPassword);
          if (passMatch) {
            req.session.user = user;
            res.json({success: true});
          } else {
            res.json({user: true});
          }
        };
      } else {
        res.json({success: false});
      }
    });
  },
  DoLogout: (req, res, next)=>{
    req.session.destroy();
    res.redirect('/');
  },
  getShopPage: async (req, res)=> {
    const categoryNames = await categoryHelpers.getCategoryNames();
    const colors = await designHelpers.getColors();
    const sizes = await designHelpers.getSizes();
    productHelpers.getProductsCount().then((count)=> {
      productHelpers.getLimitedProducts(req.query.page).then((products)=>{
        res.render('users/user-product', {user: req.session.user,
          products, count: count, page: 'shop',
          categoryNames, colors: colors.slice(0, 10), sizes});
      }).catch((error)=>{
        console.error(error);
      });
    });
  },
  GetProductPage: (req, res)=> {
    productHelpers.getProductDetails(req.params.id).then((product)=>{
      designHelpers.getDesignColors(product.designCode).then((colors)=>{
        res.render('users/single-product', {user: req.session.user,
          product: product, colors: colors[0].colors, page: 'shop'});
      });
    }).catch((err)=>
      res.json({message: 'Ninte chattom enghattaann ink manslaaknd mandhjj',
        status: '5059'}));
  },
  GetProfilePage: (req, res)=> {
    res.render('users/user-profile', {page: 'profile', user: req.session.user});
  },
  addAddress: (req, res)=> {
    const {id, address} = req.body;
    addressHelpers.addAddress(id, address).then((result)=>{
      if (result.new) {
        userHelpers.changeAddressStatus(id).then(()=> {
          req.session.user.isAddressAdded = true;
          res.json({success: true, new: true});
        });
      } else {
        res.json({success: true});
      }
    }).catch((err)=>{
      res.json({error: err.message});
    });
  },
  getAddress: (req, res) => {
    addressHelpers.getAddress(req.body.id).then((address)=> {
      res.json(address);
    }).catch((error)=> {
      res.json({error: error.message});
    });
  },
  deleteAddress: (req, res) => {
    const {id, addressId} = req.body;
    addressHelpers.deleteAddress(id, addressId).then(()=> {
      res.json({success: true});
    }).catch((err) => {
      res.json({error: err.message});
    });
  },
  addImage: (req, res)=> {
    userHelpers
        .addProfileImage(req.files[0].filename, req.session.user._id)
        .then(()=> {
          req.session.user.profilePicture = req.files[0].filename;
          req.session.user.isProfilePictureAdded = true;
          res.json({success: true});
        });
  },
  GetImage: (req, res) => {
    res.sendFile(`../profiles/${req.params.image}`, {root: __dirname});
  },
  deleteAccount: (req, res) => {
    userHelpers.deleteAccount(req.body.id).then(()=> {
      addressHelpers.deleteAccount(req.body.id);
      delete req.session.user;
      res.json({success: true});
    });
  },
  getCart: (req, res, next)=> {
    cartHelpers.getCart(req.session.user._id).then((products)=> {
      const token = crypto.randomBytes(8).toString('hex').slice(0, 8);
      req.session.checkOutToken = token;
      res.render('users/user-cart',
          {user: req.session.user, page: 'cart', products: products, token});
    }).catch((err)=> {
      next(err);
    });
  },
  addToCart: (req, res)=> {
    const {proId, userId} = req.body;
    cartHelpers.addToCart(proId, userId).then((result)=> {
      if (result.product) {
        res.json({success: true, product: true});
      } else {
        userHelpers.incCartCount(userId).then(()=> {
          req.session.user.cartCount += 1;
          res.json({success: true});
        });
      }
    }).catch((err)=> {
      res.json({error: err.message});
    });
  },
  removeFromCart: (req, res) => {
    cartHelpers.removeFromCart(req.body.id, req.session.user._id).then(()=> {
      userHelpers.decCartCount(req.session.user._id).then(()=> {
        req.session.user.cartCount += -1;
        res.json({success: true});
      }).catch((err)=> {
        res.json({error: err.message});
      });
    });
  },
  incrementQuantity: (req, res) => {
    cartHelpers.
        changeQuantity(req.session.user._id, req.body.id, 1)
        .then(() => res.json({success: true}));
  },
  decrementQuantity: (req, res)=> {
    cartHelpers.
        changeQuantity(req.session.user._id, req.body.id, -1)
        .then(() => res.json({success: true}));
  },
  changeSize: (req, res)=>{
    const {id, size} = req.body;
    cartHelpers.changeSize(id, size, req.session.user._id).then(()=> {
      res.json({success: true});
    }).catch((err)=> {
      res.json({error: err.message});
    });
  },
  getCheckout: (req, res, next) => {
    if (req.session.checkOutToken === req.params.token) {
      const user = req.session.user;
      addressHelpers.getAddress(user._id).then((address)=> {
        cartHelpers.getCart(user._id).then((products)=> {
          res.render('users/user-checkout',
              {user, page: 'checkout',
                address: address[0], products});
        });
      });
    } else {
      res.redirect('/user/cart');
    }
  },
  getOneAddress: (req, res)=> {
    const {address, userId} = req.body;
    addressHelpers.getOneAddress(address, userId).then((address)=> {
      res.json(address);
    }).catch((error)=> {
      res.json({error: error.message});
    });
  },
  checkout: async (req, res) =>{
    try {
      const {coupon, subTotal, discount, total, method, ...address} = req.body;
      if (method === 'COD') {
        const customerName = req.session.user.firstName;
        const orderId =
        // eslint-disable-next-line max-len
        `${customerName.charAt(0).toUpperCase()}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        req.session.orderId = orderId;
      }
      if (coupon !== 'No coupon applied') {
        await couponHelpers.changeStock(coupon, -1);
      }
      const products = await cartHelpers.getCart(req.session.user._id);
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
          product: item._id._id,
          quantity: item.quantity,
          size: item.size,
          price: Number(item._id.price),
        })),
      };
      details.products.forEach(async (item)=> {
        const {product, quantity, size} = item;
        await productHelpers.changeStock(product, -(Number(quantity)), size);
      });
      await orderHelpers.createOrder(details);
      await cartHelpers.clearCart(req.session.user._id);
      await userHelpers.changeCartCount(req.session.user._id);
      req.session.user.cartCount = 0;
      res.redirect(`/user/order/success/${req.session.orderId}`);
    } catch (error) {
      next(error);
    };
  },
  addCoupon: async (req, res) => {
    const {coupon, total} = req.body;
    try {
      const couponData = await couponHelpers.getCoupon(coupon);
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
      const discount =
       Math.min(Number(total) * (discountPercentage / 100), offerUpto);
      await cartHelpers.addCoupon(couponCode, discount, req.session.user._id);
      return res.json({success: true, discount, couponCode});
    } catch (err) {
      console.error(err);
      return res.json({success: false});
    }
  },
  createPaymentOnline: (req, res)=> {
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
      res.json({error: err.message});
      console.error(err);
    }
  },
  verifyPayment: (req, res)=> {
    try {
      const details = req.body;
      const crypto = require('crypto');
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
  },
  getSuccessOrder: async (req, res, next)=> {
    if (req.session.orderId === req.params.orderId) {
      delete req.session.orderId;
      const order = await orderHelpers.getOrder(req.params.orderId);
      if (order) {
        res.render('users/order-success', {user: req.session.user,
          order: order,
          page: 'order-success'});
      }
    } else {
      res.redirect('/');
    }
  },
  verifyStock: async (req, res, next) => {
    const products = await cartHelpers.getCart(req.session.user._id);
    const results = await Promise.all(products.map(async (product) => {
      const stock =
       await productHelpers.getStock(product._id._id, product.size);
      if (Number(stock) < Number(product.quantity)) {
        return product._id.name;
      } else {
        return null;
      }
    }));
    const insufficientProducts = results.filter((result) => result !== null);
    if (insufficientProducts.length > 0) {
      return res.json({success: false, products: insufficientProducts});
    } else {
      return res.json({success: true});
    }
  },
  getOrderPage: async (req, res)=> {
    const orders = await orderHelpers.getOrders(req.session.user._id);
    res.render('users/my-orders',
        {user: req.session.user, page: 'order', orders});
  },
  getOrderDetails: async (req, res)=> {
    const order = await orderHelpers.getOneOrder(req.body.id);
    if (order) {
      return res.json({success: true, order});
    }
    return res.json({success: false});
  },
  changeStatusOrder: (req, res)=> {
    const {id, status, products} = req.body;
    if (status === 'Cancelled') {
      products.forEach((product)=>{
        // eslint-disable-next-line max-len
        productHelpers.changeStock(product.product._id, Number(product.quantity), product.size);
      });
    }
    orderHelpers.changeOrderStatus(id, status).then(()=> {
      res.json({success: true});
    }).catch((err)=> {
      res.json({error: err.message});
    });
  },
  getCertainProducts: async (req, res)=> {
    const {category, color, size, min, max} = req.query;
    const details = {};
    if (max.trim().length > 0 && min.trim().length > 0) {
      details.price = {$lte: Number(max.trim()), $gte: Number(min.trim())};
    };
    if (category.trim().length > 0 && category.trim() != 'ALL') {
      details.category = category.trim();
    }
    if (color.trim().length > 0 && color.trim() != 'ALL') {
      details.exactColor = color.trim();
    }
    if (size.trim().length > 0 && size.trim() != 'ALL') {
      details.sizes = {$elemMatch: {size: size.trim()}};
    }
    const products = await productHelpers.filterProducts(details);
    res.json({success: true, products, user: req.session.user._id});
  },
  getSearchResults: async (req, res) => {
    const {type, value} = req.params;
    if (type === 'category') {
      const categories = await productHelpers.getCategoryNames(value);
      return res.json({success: true, categories});
    }
    if (type === 'products') {
      const products = await productHelpers.getProductsNames(value);
      return res.json({success: true, products: products.slice(0, 5)});
    }
    if (type === 'colors') {
      const colors = await productHelpers.getColorsNames(value);
      return res.json({success: true, colors});
    }
    if (type === 'genders') {
      const genders = await productHelpers.getGendersNames(value);
      return res.json({success: true, genders});
    }
    res.json({success: true});
  },
  getResults: async (req, res) => {
    const {type, value} = req.params;
    const page = req.query.page;
    let products;
    let count;
    if (type === 'products') {
      products = await productHelpers.getProductsProducts(value, page);
      count = await productHelpers.getProductsProductsCount(value);
    } else if (type === 'category') {
      products = await productHelpers.getCategoryProducts(value, page);
      count = await productHelpers.getCategoryProductsCount(value);
    } else if (type === 'colors') {
      products = await productHelpers.getColorsProducts(value, page);
      count = await productHelpers.getColorsProductsCount(value);
    } else if (type === 'genders') {
      products = await productHelpers.getGendersProducts(value, page);
      count = await productHelpers.getGendersProductsCount(value);
    };
    const categoryNames = await categoryHelpers.getCategoryNames();
    const colors = await designHelpers.getColors();
    const sizes = await designHelpers.getSizes();
    const pageName = `results/${type}/${value}`;
    const user = req.session.user;
    res.render('users/user-product', {user,
      products, count, page: pageName,
      categoryNames, colors: colors.slice(0, 10), sizes});
  },
  editProfile: async (req, res, next) => {
    try {
      const {email, phoneNo, firstName, lastName} = req.body;
      await userHelpers.editProfile(req.session.user._id, req.body);
      req.session.user.email = email;
      req.session.user.phoneNo = phoneNo;
      req.session.user.firstName = firstName;
      req.session.user.lastName = lastName;
      res.json({success: true});
    } catch (error) {
      next(error);
    }
  },
  checkEmail: async (req, res)=> {
    const email = await userHelpers.checkEmailExist(req.query.email);
    if (email) {
      return res.json({success: false});
    }
    return res.json({success: true});
  },
  getOneEditAddress: async (req, res, next) => {
    try {
      const address =
      await addressHelpers.getOneAddress(req.params.id, req.session.user._id);
      if (address) {
        return res.json({success: true, address});
      }
      return res.json({success: false});
    } catch (error) {
      next(error);
    }
  },
  editAddress: (req, res, next)=> {
    const {id, ...address} = req.body;
    addressHelpers.editAddress(id, address).then(()=> {
      res.json({success: true});
    }).catch((err)=> {
      next(err);
    });
  },
};

