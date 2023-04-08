const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../services/email-otp');
const categoryHelpers = require('../helpers/categoryHelpers');
const Design = require('../models/designModel');
const Order = require('../models/orderModel');
const Wishlist = require('../models/wishlistModel');
const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');
const Razorpay = require('razorpay');
const Address = require('../models/addressModel');
const User = require('../models/userModel');

const instance = new Razorpay({
  key_id: process.env.RAZ_KEY_ID,
  key_secret: process.env.RAZ_SECRET_KEY,
});


module.exports = {
  getHomePage: async (req, res, next) => {
    const products = await Product.find().sort({createdAt: -1}).limit(8);
    const banners = await Banner.find();
    res.render('users/user-home',
        {user: req.session.user, page: 'home', products, banners});
  },
  getLoginPage: (req, res)=>{
    const reset = req.session.passwordReset;
    const signin = req.session.signin;
    const messages = req.session.userMessage;
    delete req.session.userMessage;
    delete req.session.passwordReset;
    delete req.session.signin;
    res.render('users/user-login', {reset, signin, messages});
  },
  handleEmail: async (req, res, next)=>{
    try {
      const email = req.body.email;
      const user = await User.findOne({email: email});
      if (user) {
        res.json({user: true});
      } else {
        const otp = await sendEmail.sendOtp(email);
        console.log(otp);
        req.session.userDetails = {
          email: email,
          otp: otp,
        };
        res.json({success: true});
      };
    } catch (error) {
      next(error);
    }
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
    try {
      const pass = await bcrypt.hash(req.body.password, 10);
      const userDetails = req.session.userDetails;
      userDetails.hashPassword = pass;
      const user = await User.create(userDetails);
      delete req.session.userDetails;
      req.session.user = user;
      res.json({success: true});
    } catch (error) {
      next(error);
    };
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
  DoLogin: async (req, res, next)=>{
    try {
      const {email, password} = req.body;
      const user = await User.findOne({email: email});
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
    } catch (error) {
      next(error);
    }
  },
  DoLogout: (req, res, next)=>{
    req.session.destroy();
    res.redirect('/');
  },
  getShopPage: async (req, res, next)=> {
    try {
      const categoryNames = await categoryHelpers.getCategoryNames();
      const colors = await Design.distinct('colors');
      const sizes = await Design.distinct('sizes');
      const count = await Product.count();
      const products =
      await Product.find().limit(9).skip((req.query.page-1)*9);
      res.render('users/user-product', {user: req.session.user,
        products, count: count, page: 'shop',
        categoryNames, colors: colors.slice(0, 10), sizes});
    } catch (error) {
      next(error);
    }
  },
  GetProductPage: async (req, res, next)=> {
    try {
      const id = req.params.id;
      let product;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      } else {
        throw new Error('Tried to change the id value , huh?');
      };
      // eslint-disable-next-line max-len
      const colors= Design.find({designCode: product.designCode}).select('colors -_id');
      const categoryRelatedProducts = await Product.aggregate([
        {
          $match: {category: product.category},
        },
        {
          $sample: {size: 2},
        },
      ]);
      const colorRelatedProduct = await Product.aggregate([
        {
          $match: {broadColor: product.broadColor},
        },
        {
          $sample: {size: 1},
        },
      ]);
      const designRelatedProduct = await Product.aggregate([
        {
          $match: {designCode: product.designCode},
        },
        {
          $sample: {size: 1},
        },
      ]);
      res.render('users/single-product', {user: req.session.user,
        product: product, colors: colors[0].colors, page: 'shop',
        categoryRelatedProducts, colorRelatedProduct, designRelatedProduct});
    } catch (error) {
      next(error);
    };
  },
  GetProfilePage: (req, res)=> {
    res.render('users/user-profile', {page: 'profile', user: req.session.user});
  },
  addAddress: async (req, res, next)=> {
    try {
      const {id, address} = req.body;
      let doc = await Address.findById(id);
      if (!doc) {
        doc = await Address.create({_id: id, addresses: [address]});
        await User.findByIdAndUpdate(id, {isAddressAdded: true});
        req.session.user.isAddressAdded = true;
        res.json({success: true, new: true,
          address: doc.addresses.slice(-1)[0]});
      } else {
        doc.addresses.push(address);
        await doc.save();
        res.json({success: true, address: doc.addresses.slice(-1)[0]});
      }
    } catch (err) {
      next(err);
    }
  },
  getAddress: (req, res, next) => {
    Address.findById(req.body.id).then((address)=> {
      if (address) {
        return res.json(address.addresses);
      }
      res.json([]);
    }).catch((err) => {
      next(err);
    });
  },
  deleteAddress: async (req, res, next) => {
    try {
      const {id, addressId} = req.body;
      await Address.findByIdAndUpdate(id,
          {$pull: {addresses: {_id: addressId}}});
      res.json({success: true});
    } catch (err) {
      next(err);
    }
  },
  addImage: async (req, res, next)=> {
    try {
      const doc = await User.findById(req.session.user._id);
      doc.profilePicture = req.files[0].filename;
      doc.isProfilePictureAdded = true;
      await doc.save();
      req.session.user.profilePicture = req.files[0].filename;
      req.session.user.isProfilePictureAdded = true;
      res.json({success: true});
    } catch (error) {
      next(error);
    }
  },
  GetImage: (req, res) => {
    res.sendFile(`../profiles/${req.params.image}`, {root: __dirname});
  },
  deleteAccount: async (req, res) => {
    try {
      const id = req.body.id;
      await User.findByIdAndDelete(id);
      await Address.findByIdAndDelete(id);
      delete req.session.user;
      res.json({success: true});
    } catch (error) {
      next(error);
    }
  },
  getCart: async (req, res, next)=> {
    try {
      const cart = await Cart.findById(req.session.user._id).populate({
        path: 'products._id',
        model: Product,
      });
      const token = crypto.randomBytes(8).toString('hex').slice(0, 8);
      req.session.checkOutToken = token;
      res.render('users/user-cart',
          {user: req.session.user,
            page: 'cart', products: cart?.products ?? [], token});
    } catch (error) {
      next(error);
    }
  },
  addToCart: async (req, res, next)=> {
    try {
      let product;
      const {proId, userId} = req.body;
      const cart = await Cart.findById(userId);
      if (cart) {
        const result =
           cart.products.some((product) => product._id.equals(proId));
        if (result) {
          product = true;
        } else {
          cart.products.push({_id: proId, quantity: 1});
          await cart.save();
          product = false;
        }
      } else {
        const newCart = new Cart({
          _id: userId,
          products: [{_id: proId,
            quantity: 1}],
        });
        await newCart.save();
        product = false;
      }
      if (product) {
        return res.json({success: true, product: true});
      } else {
        await User.findByIdAndUpdate(userId, {$inc: {cartCount: 1}});
        req.session.user.cartCount += 1;
        return res.json({success: true});
      }
    } catch (error) {
      next(error);
    }
  },
  removeFromCart: async (req, res, next) => {
    try {
      await Cart.findByIdAndUpdate(req.session.user._id,
          {$pull: {products: {_id: req.body.id}}});
      await User.findByIdAndUpdate(req.session.user._id,
          {$inc: {cartCount: -1}});
      req.session.user.cartCount += -1;
      res.json({success: true});
    } catch (error) {
      next(error);
    };
  },
  incrementQuantity: async (req, res, next) => {
    await Cart.updateOne(
        {'_id': req.session.user._id, 'products._id': req.body.id},
        {$inc: {'products.$.quantity': 1}},
    ).then(()=> res.json({success: true})).catch((err)=> next(err));
  },
  decrementQuantity: async (req, res, next)=> {
    await Cart.updateOne(
        {'_id': req.session.user._id, 'products._id': req.body.id},
        {$inc: {'products.$.quantity': -1}},
    ).then(()=> res.json({success: true})).catch((err)=> next(err));
  },
  changeSize: async (req, res, next)=>{
    const {id, size} = req.body;
    await Cart.updateOne(
        {'_id': req.session.user._id, 'products._id': id},
        {$set: {'products.$.size': size}},
    ).then(()=> res.json({success: true})).catch((err)=> next(err));
  },
  getCheckout: async (req, res, next) => {
    try {
      if (req.session.checkOutToken === req.params.token) {
        const user = req.session.user;
        const address = await Address.findById(user._id);
        const cart = await Cart.findById(user._id).populate({
          path: 'products._id',
          model: Product,
        });
        res.render('users/user-checkout',
            {user, page: 'checkout',
              address: address?.addresses[0],
              products: cart?.products ?? []});
      } else {
        res.redirect('/cart');
      }
    } catch (error) {
      next(error);
    }
  },
  getOneAddress: async (req, res, next)=> {
    try {
      const {addressId, userId} = req.body;
      const address = await Address.findById(userId);
      const spAddress =
      address.addresses.find((address)=> address._id.toString() === addressId);
      res.json(spAddress);
    } catch (error) {
      next(error);
    }
  },
  checkout: async (req, res, next) =>{
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
        await Coupon.updateOne({couponCode: coupon},
            {$inc: {usageLimit: -1}});
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
        const update = {$inc: {'stock': -(Number(quantity)),
          'sizes.$[elem].stock': -(Number(quantity))}};
        const options = {arrayFilters: [{'elem.size': size}]};
        await Product.updateOne( filter, update, options);
      });
      await Order.create(details);
      await User.findByIdAndUpdate(req.session.user._id,
          {$set: {cartCount: 0}});
      req.session.user.cartCount = 0;
      res.redirect(`/order/success/${req.session.orderId}`);
    } catch (error) {
      next(error);
    };
  },
  addCoupon: async (req, res) => {
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
      const discount =
       Math.min(Number(total) * (discountPercentage / 100), offerUpto);
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
  },
  verifyStock: async (req, res, next) => {
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
      } else {
        return res.json({success: true});
      }
    } catch (error) {
      next(error);
    }
  },
  getOrderPage: async (req, res)=> {
    const orders = await Order.find({userId: req.session.user._id})
        .populate({
          path: 'products.product',
          model: Product,
        }).sort({createdAt: -1});
    res.render('users/my-orders',
        {user: req.session.user, page: 'order', orders});
  },
  getOrderDetails: async (req, res)=> {
    const order = await Order.findById(req.body.id).populate({
      path: 'products.product',
      model: Product,
    });
    if (order) {
      return res.json({success: true, order});
    }
    return res.json({success: false});
  },
  changeStatusOrder: async (req, res, next)=> {
    try {
      const {id, status, products} = req.body;
      if (status === 'Cancelled') {
        products.forEach(async (product)=>{
          // eslint-disable-next-line max-len
          const filter = {_id: product.product._id};
          const update = {$inc: {'stock': Number(product.quantity),
            'sizes.$[elem].stock': Number(product.quantity)}};
          const options = {arrayFilters: [{'elem.size': product.size}]};
          await Product.updateOne( filter, update, options);
        });
      }
      await Order.findByIdAndUpdate(id, {status: status});
      res.json({success: true});
    } catch (error) {
      next(error);
    }
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
    const products = await Product.find(details);
    res.json({success: true, products, user: req.session?.user?._id});
  },
  getSearchResults: async (req, res) => {
    const {type, value} = req.params;
    if (type === 'category') {
      const categories =
       await Product.find({category: {$regex: new RegExp(value, 'i')}})
           .distinct('category');
      return res.json({success: true, categories});
    }
    if (type === 'products') {
      const products =
       await Product.find({name: {$regex: new RegExp(value, 'i')}})
           .distinct('name');
      return res.json({success: true, products: products.slice(0, 5)});
    }
    if (type === 'colors') {
      const exactColors =
      await Product.find({exactColor: {$regex: new RegExp(value, 'i')}})
          .distinct('exactColor');
      const broadColors =
    await Product.find({broadColor: {$regex: new RegExp(value, 'i')}})
        .distinct('broadColor');
      const colors = [...new Set([...exactColors, ...broadColors])];
      return res.json({success: true, colors});
    }
    if (type === 'genders') {
      const genders = await Product.find({gender:
          {$regex: new RegExp(value, 'i')}})
          .distinct('gender');
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
      products = await Product.find({name: value}).skip((page -1)* 9).limit(9);
      count = await Product.find({name: value}).count();
    } else if (type === 'category') {
      products = await Product.find({category: value})
          .skip((page -1)* 9).limit(9);
      count = await Product.find({category: value}).count();
    } else if (type === 'colors') {
      products = await Product.find({$or: [{exactColor: value},
        {broadColor: value}]}).skip((page -1)* 9).limit(9);
      count = await Product.find({$or: [{exactColor: value},
        {broadColor: value}]}).count();
    } else if (type === 'genders') {
      products = await Product.find({gender: value})
          .skip((page -1)* 9).limit(9);
      count = await Product.find({gender: value}).count();
    };
    const categoryNames = await categoryHelpers.getCategoryNames();
    const colors = await Design.distinct('colors');
    const sizes = await Design.distinct('sizes');
    const pageName = `results/${type}/${value}`;
    const user = req.session.user;
    res.render('users/user-product', {user,
      products, count, page: pageName,
      categoryNames, colors: colors.slice(0, 10), sizes});
  },
  editProfile: async (req, res, next) => {
    try {
      const {email, phoneNo, firstName, lastName} = req.body;
      await User.findByIdAndUpdate(req.session.user._id, req.body);
      req.session.user.email = email;
      req.session.user.phoneNo = phoneNo;
      req.session.user.firstName = firstName;
      req.session.user.lastName = lastName;
      res.json({success: true});
    } catch (error) {
      next(error);
    }
  },
  checkEmail: async (req, res, next)=> {
    User.findOne({email: req.query.email})
        .then((email)=> {
          if (email) {
            return res.json({success: false});
          }
          return res.json({success: true});
        }).catch((error)=> next(error));
  },
  getOneEditAddress: async (req, res, next) => {
    try {
      const id = req.params.id;
      const address = await Address.findById(req.session.user._id);
      const spAddress =
       address.addresses.find((address)=> address._id.toString() === id);
      if (spAddress) {
        return res.json({success: true, address: spAddress});
      }
      return res.json({success: false});
    } catch (error) {
      next(error);
    }
  },
  editAddress: async (req, res, next)=> {
    const {id, ...address} = req.body;
    await Address.updateOne({'addresses._id': id},
        {'addresses.$': address}).then(()=> {
      res.json({success: true});
    }).catch((err)=> {
      next(err);
    });
  },
  forgotPassword: async (req, res, next)=> {
    try {
      const user = await User.findOne({email: req.body.email});
      if (!user) {
        return res.json({success: false, user: true});
      }
      const token = crypto.randomBytes(20).toString('hex');
      await sendEmail.sendUrl(req.body.email, token);
      user.token = token;
      await user.save();
      res.json({success: true});
    } catch (error) {
      next(error);
    };
  },
  getResetPassword: async (req, res, next)=> {
    const user = await User.findOne({token: req.params.token});
    if (user) {
      req.session.resetToken = req.params.token;
      return res.render('users/reset-password');
    }
    next(new Error('Invalid token'));
  },
  ResetPassword: async (req, res, next)=> {
    const user = await User.findOne({token: req.session.resetToken});
    if (user) {
      const password = await bcrypt.hash(req.body.password, 10);
      const update = {hashPassword: password, $unset: {token: 1}};
      await User.updateOne({token: req.session.resetToken}, update);
      delete req.session.resetToken;
      req.session.passwordReset = true;
      return res.redirect('/login');
    }
    next(new Error('Invalid token'));
  },
  checkPasswordExists: async (req, res, next)=> {
    const user = await User.findOne({token: req.session.resetToken});
    if (user) {
      const result = await bcrypt
          .compare(req.params.password, user.hashPassword);
      if (result) {
        return res.json({success: true, exists: true});
      };
      return res.json({success: true});
    }
    next(new Error('Invalid token'));
  },
  getWishlist: async (req, res, next)=> {
    try {
      const wishlist = await Wishlist.findById(req.session.user._id).populate({
        path: 'products._id',
        model: Product,
      });
      res.render('users/wishlist',
          {user: req.session.user,
            page: 'wishlist', products: wishlist?.products ?? []});
    } catch (error) {
      next(error);
    }
  },
  addWishlist: async (req, res, next)=> {
    try {
      const {proId, userId} = req.body;
      const wishlist = await Wishlist.findById(userId);
      if (wishlist) {
        const result =
           wishlist.products.some((product) => product._id.equals(proId));
        if (result) {
          return res.json({success: true, product: true});
        } else {
          wishlist.products.push({_id: proId, quantity: 1});
          await wishlist.save();
          return res.json({success: true});
        }
      } else {
        const newWishlist = new Wishlist({
          _id: userId,
          products: [{_id: proId,
            quantity: 1}],
        });
        await newWishlist.save();
        return res.json({success: true});
      }
    } catch (error) {
      next(error);
    }
  },
  removeFromWishlist: (req, res, next) => {
    Wishlist.findByIdAndUpdate(req.session.user._id,
        {$pull: {products: {_id: req.body.id}}})
        .then(()=> {
          res.json({success: true});
        }).catch((err)=> {
          next(err);
        });
  },
  checkAddress: async (req, res, next)=> {
    try {
      const address = await Address.findById(req.session.user._id);
      if (address) {
        if (address.addresses.length > 0) {
          return res.json({success: true});
        }
      }
      return res.json({success: false});
    } catch (error) {
      next(error);
    }
  },
};

