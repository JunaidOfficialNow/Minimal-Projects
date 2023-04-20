const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const user = require('../controllers/userController');
const index = require('../controllers/user');
const {ProfileUpload} = require('../services/multer');
const {checkLogin, verifyLogin, checkAdminLoggedIn} =
 require('../middlewares/userMiddlewares');


// get requests
router.get('/', checkAdminLoggedIn, user.getHomePage);
router.get('/login', checkAdminLoggedIn, checkLogin, index.getLoginPage);
router.get('/logout', verifyLogin, index.DoLogout);
router.get('/shop', user.getShopPage);
router.get('/product/:id', user.GetProductPage);
router.get('/my-profile', verifyLogin, user.GetProfilePage);
router.get('/get/image/:image', verifyLogin, user.GetImage);
router.get('/cart', verifyLogin, user.getCart);
router.get('/checkout/:token', verifyLogin, user.getCheckout);
router.get('/order/success/:orderId', verifyLogin, user.getSuccessOrder);
router.get('/my-orders', verifyLogin, user.getOrderPage);
router.get('/products', user.getCertainProducts);
router.get('/search/:type/:value', user.getSearchResults);
router.get('/results/:type/:value', user.getResults);
router.get('/email-check', verifyLogin, user.checkEmail);
router.get('/addresses/:id', verifyLogin, user.getOneEditAddress);
router.get('/password/:password', user.checkPasswordExists);
router.get('/wishlist', verifyLogin, user.getWishlist);
router.get('/checkout/check/address', verifyLogin, user.checkAddress);

// post requests
router.post('/signup/email', index.handleEmail);
router.post('/signup/otp', index.handleOtp);
router.post('/signup/resend-otp', index.handleResendOtp);
router.post('/signup/names', index.handleNames);
router.post('/signup/password', index.handlePassword);
router.post('/address', verifyLogin, user.addAddress);
router.post('/get/address', verifyLogin, user.getAddress);
router.post('/add/to/cart', verifyLogin, user.addToCart);
router.post('/checkout', verifyLogin, user.checkout);
router.post('/checkout/get/one/address', verifyLogin, user.getOneAddress);
router.post('/checkout/get/address', verifyLogin, user.getAddress);
router.post('/checkout/add/coupon', verifyLogin, user.addCoupon);
router.post('/checkout/payment/online', verifyLogin, user.createPaymentOnline);
router.post('/checkout/verify/payment', verifyLogin, user.verifyPayment);
router.post('/checkout/check/stock', verifyLogin, user.verifyStock);
router.post('/checkout/address', verifyLogin, user.addAddress);
router.post('/order/details', verifyLogin, user.getOrderDetails);
router.post('/forgotPassword', user.forgotPassword);
router.post('/wishlist', verifyLogin, user.addWishlist);
// post requests
router.post('/login', index.DoLogin);


// route endpoints
router.route('/reset-password/:token')
    .get( checkLogin, user.getResetPassword)
    .post(user.ResetPassword);

// delete requests

router.delete('/delete/address', verifyLogin, user.deleteAddress);
router.delete('/delete/account', verifyLogin, user.deleteAccount);
router.delete('/cart/remove/from/cart', verifyLogin, user.removeFromCart);

// put requests

router.put('/add/image', verifyLogin,
    ProfileUpload.any(), user.addImage);
router.put('/cart/increment/quantity', verifyLogin, user.incrementQuantity);
router.put('/cart/decrement/quantity', verifyLogin, user.decrementQuantity);
router.put('/cart/change/size', verifyLogin, user.changeSize);
router.put('/profile', verifyLogin, user.editProfile);
router.put('/addresses', verifyLogin, user.editAddress);

// patch requests

router.patch('/order/change/status', verifyLogin, user.changeStatusOrder);
router.patch('/wishlist', verifyLogin, user.removeFromWishlist);

/* ----------------------------------------- */

module.exports = router;
