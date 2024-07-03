const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const user = require('../controllers/user');
const {ProfileUpload} = require('../utils/file-uploads/multer.helpers');
const {checkLogin, verifyLogin, checkAdminLoggedIn} =
 require('../middlewares/user.middlewares');


// get requests
router.get('/', checkAdminLoggedIn, user.getHomePage);
router.get('/login', checkAdminLoggedIn, checkLogin, user.getLoginPage);
router.get('/logout', verifyLogin, user.DoLogout);
router.get('/shop', user.getShopPage);
router.get('/product/:id', user.getProductPage);
router.get('/my-profile', verifyLogin, user.getProfilePage);
router.get('/get/image/:image', verifyLogin, user.getImage);
router.get('/cart', verifyLogin, user.getCart);
router.get('/checkout/:token', verifyLogin, user.getCheckout);
router.get('/order/success/:orderId', verifyLogin, user.getSuccessOrder);
router.get('/my-orders', verifyLogin, user.getOrderPage);
router.get('/products', user.getCertainProducts);
router.get('/search/:type/:value', user.getSearchResults);
router.get('/results/:type/:value', user.getResults);
router.get('/email-check', verifyLogin, user.checkEmailExists);
router.get('/addresses/:id', verifyLogin, user.getOneEditAddress);
router.get('/password/:password', user.checkPasswordExists);
router.get('/wishlist', verifyLogin, user.getWishlist);
router.get('/checkout/check/address', verifyLogin, user.checkAddress);

// post requests
router.post('/signup/email', user.handleEmail);
router.post('/signup/otp', user.handleOtp);
router.post('/signup/resend-otp', user.handleResendOtp);
router.post('/signup/names', user.handleNames);
router.post('/signup/password', user.handlePassword);
router.post('/address', verifyLogin, user.addAddress);
router.post('/get/address', verifyLogin, user.getAddress);
router.post('/add/to/cart', verifyLogin, user.addToCart);
router.post('/checkout', verifyLogin, user.placeOrder);
router.post('/checkout/get/one/address', verifyLogin, user.getOneAddress);
router.post('/checkout/get/address', verifyLogin, user.getAddress);
router.post('/checkout/add/coupon', verifyLogin, user.applyCoupon);
router.post('/checkout/payment/online',
    verifyLogin,
    user.initiatePaymentOnline);
router.post('/checkout/verify/payment', verifyLogin, user.verifyPayment);
router.post('/checkout/check/stock', verifyLogin, user.verifyStock);
router.post('/checkout/address', verifyLogin, user.addAddress);
router.post('/order/details', verifyLogin, user.getOrderDetails);
router.post('/forgotPassword', user.sendPasswordResetToken);
router.post('/wishlist', verifyLogin, user.addWishlist);
// post requests
router.post('/login', user.DoLogin);


// route endpoints
router.route('/reset-password/:token')
    .get( checkLogin, user.getResetPassword)
    .post(user.resetPassword);

// delete requests

router.delete('/delete/address', verifyLogin, user.deleteAddress);
router.delete('/delete/account', verifyLogin, user.deleteAccount);
router.delete('/cart/remove/from/cart', verifyLogin, user.removeFromCart);

// put requests

router.put('/add/image', verifyLogin,
    ProfileUpload.any(), user.addProfilePhoto);
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
