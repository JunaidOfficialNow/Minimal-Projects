const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const admin = require('../controllers/adminController');
const index = require('../controllers/admin/index');
const {csrfProtection, requestMethod} =
 require('../middlewares/commonMiddlewares');
const middle = require('../middlewares/adminMiddlewares');
const {uploadOptions, DesignUpload, ProductUpload, BannerUpload} =
 require('../services/multer');

router.use(requestMethod);


// get requests
router.get('/', middle.checkUserLogin, middle.checkLogin, index.getLogin);
router.get('/csrf', middle.verifyLogin, csrfProtection, admin.getCsrf);
router.get('/logout', middle.verifyLogin, index.DoLogout);
router.get('/home', middle.checkUserLogin, middle.verifyLogin, admin.getHome);
router.get('/design/category', middle.verifyLogin, index.getDesignCategory);
router.get('/design/category/add',
    middle.verifyLogin, index.getAddDesignCategory);
router.get('/products', middle.verifyLogin, admin.getProductsPage);
router.get('/product/add', middle.verifyLogin, admin.getAddProductPage);
router.get('/products/:id', middle.verifyLogin, admin.getEditProductPage);
router.get('/coupons', middle.verifyLogin, admin.getCouponsPage);
router.get('/coupons/:id', middle.verifyLogin, admin.getCoupon);
router.get('/orders', middle.verifyLogin, admin.getOrdersPage);
router.get('/order/details/:id', middle.verifyLogin, admin.getOrderDetailsPage);
router.get('/banners', middle.verifyLogin, admin.getBannersPage);
router.get('/banners/:name', middle.verifyLogin, admin.getEditBannersPage);
router.get('/banners/name/:name', middle.verifyLogin, admin.checkNameExists);
router.get('/sales-and-revenue', middle.verifyLogin, admin.salesAndRevenue);
router.get('/sales-report/:status',
    middle.verifyLogin, admin.downloadSalesReport);
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
router.post('/product/add', middle.verifyLogin, admin.addProductName);
router.post('/add/product/all',
    middle.verifyLogin, ProductUpload.any(), admin.addProductAll);
router.post('/coupons/create', middle.verifyLogin, admin.createCoupon);
router.post('/order/details', middle.verifyLogin, admin.getOrderDetails);

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
    BannerUpload.single('image'), admin.updateBanners);

router.put('/product', middle.verifyLogin,
    ProductUpload.any(), admin.updateProduct);

router.put('/coupons', middle.verifyLogin, admin.updateCoupons);
// delete requests

router.delete('/deleteCategory', middle.verifyLogin, index.deleteCategory);

// Patch requests
router.patch('/order/change/status',
    middle.verifyLogin, admin.changeOrderStatus);
router.patch('/products/COD', middle.verifyLogin, admin.changeProductCODStatus);
router.patch('/products/active',
    middle.verifyLogin, admin.changeProductActiveStatus);
router.patch('/design/status', middle.verifyLogin, index.changeDesignStatus);
router.patch('/coupon/status', middle.verifyLogin, admin.changeCouponStatus);

module.exports = router;
