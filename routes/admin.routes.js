const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const getCsrf = require('../controllers/shared/csrf.controller');
const index = require('../controllers/admin');
const {csrfProtection, requestMethod} =
 require('../middlewares/common.middlewares');
const middle = require('../middlewares/admin.middlewares');
const {uploadOptions, DesignUpload, ProductUpload, BannerUpload} =
 require('../utils/file-uploads/multer.helpers');

router.use(requestMethod);


// get requests
router.get('/', middle.checkUserLogin, middle.checkLogin, index.getLogin);
router.get('/csrf', middle.verifyLogin, csrfProtection, getCsrf);
router.get('/logout', middle.verifyLogin, index.DoLogout);
router.get('/home', middle.checkUserLogin, middle.verifyLogin,
    index.getDashboard);
router.get('/design/category', middle.verifyLogin, index.getDesignCategory);
router.get('/design/category/add',
    middle.verifyLogin, index.getAddDesignCategory);
router.get('/products', middle.verifyLogin, index.getProductsPage);
router.get('/product/add', middle.verifyLogin, index.getAddProductPage);
router.get('/products/:id', middle.verifyLogin, index.getEditProductPage);
router.get('/coupons', middle.verifyLogin, index.getCouponsPage);
router.get('/coupons/:id', middle.verifyLogin, index.getCoupon);
router.get('/orders', middle.verifyLogin, index.getOrdersPage);
router.get('/order/details/:id', middle.verifyLogin, index.getOrderDetailsPage);
router.get('/banners', middle.verifyLogin, index.getBannersPage);
router.get('/banners/:name', middle.verifyLogin, index.getEditBannersPage);
router.get('/banners/name/:name', middle.verifyLogin, index.checkNameExists);
router.get('/sales-and-revenue', middle.verifyLogin, index.salesAndRevenue);
router.get('/sales-report/:status',
    middle.verifyLogin, index.downloadOrdersReport);
// Post requests

router.post('/', index.DoLogin);
router.post('/verify', index.verifyOtp);
router.post('/resendOtp', index.resendOtp);
router.post('/addCategory',
    middle.verifyLogin,
    csrfProtection,
    middle.checkCsrf,
    index.addCategory);
router.post('/getUsers', middle.verifyLogin, index.getUsers);
router.post('/addCatImage', middle.verifyLogin,
    csrfProtection, middle.checkCsrf,
    uploadOptions.single('file'), index.addCatImage);
router.post('/getCategories', middle.verifyLogin, index.getCategories);
router.post('/categoryDetails', middle.verifyLogin, index.getCategoryDetails);
router.post('/category/names', middle.verifyLogin, index.getCategoryNames);
router.post('/design/category/add',
    middle.verifyLogin, DesignUpload.single('DesignFile'),
    index.AddDesignCategory);
router.post('/design/code/unique', middle.verifyLogin, index.checkCodeExists);
router.post('/get/design/code', middle.verifyLogin, index.getDesignCodes);
router.post('/product/add', middle.verifyLogin, index.addProductName);
router.post('/add/product/all',
    middle.verifyLogin, ProductUpload.any(), index.addProductAll);
router.post('/coupons/create', middle.verifyLogin, index.createCoupon);
router.post('/order/details', middle.verifyLogin, index.getOrderDetails);

// put requests

router.put('/block-user', middle.verifyLogin, index.blockUser);
router.put('/unblock-user', middle.verifyLogin, index.unblockUser);
router.put('/deactivateCategory', middle.verifyLogin, index.deactivateCategory);
router.put('/activateCategory', middle.verifyLogin, index.activateCategory);
router.put('/categoryUpdate', middle.verifyLogin,
    csrfProtection, middle.checkCsrf, index.updateCategory);
router.put('/categoryImageUpdate', middle.verifyLogin, csrfProtection,
    middle.checkCsrf, uploadOptions.single('file'), index.categoryImageUpdate);
router.put('/banners', middle.verifyLogin,
    BannerUpload.single('image'), index.updateBanners);

router.put('/product', middle.verifyLogin,
    ProductUpload.any(), index.updateProduct);

router.put('/coupons', middle.verifyLogin, index.updateCoupons);
// delete requests

router.delete('/deleteCategory', middle.verifyLogin, index.deleteCategory);

// Patch requests
router.patch('/order/change/status',
    middle.verifyLogin, index.changeOrderStatus);
router.patch('/products/COD', middle.verifyLogin, index.changeProductCODStatus);
router.patch('/products/active',
    middle.verifyLogin, index.changeProductActiveStatus);
router.patch('/design/status', middle.verifyLogin, index.changeDesignStatus);
router.patch('/coupon/status', middle.verifyLogin, index.changeCouponStatus);

module.exports = router;
