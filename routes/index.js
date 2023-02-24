const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const index = require('../controllers/indexController');
const {checkAdminLoggedIn, checkBlocked} =
 require('../middlewares/userMiddlewares');


router.get('/', checkBlocked, checkAdminLoggedIn, index.getHomePage);


module.exports = router;
