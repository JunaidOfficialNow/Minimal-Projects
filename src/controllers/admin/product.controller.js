
const productServices = require('../../services/product.services');
const designServices = require('../../services/design.services');

const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

exports.getProductsPage = catchAsync(async (req, res, next) => {
  const products = await productServices.getAllProducts();
  res.render('admins/admin-products', {
    admin: req.session.admin,
    products,
  });
});

exports.addProductName = (req, res) => {
  const {name, designCode} = req.body;
  req.session.addProduct = {name, designCode};
  res.json({success: true});
};

exports.getAddProductPage = catchAsync(async (req, res, next) => {
  const {name, designCode} = req.session.addProduct;
  const doc = await designServices.getDesignByCode(designCode);
  res.render('admins/admin-add-product', {name, doc});
});

exports.addProductAll = catchAsync(async (req, res, next)=> {
  // need to modify the dto from frontend by creating
  //  the sizes array from the frontend  itselt;
  const dto = {name, designCode, gender, sizes, exactColor, broadColor, price,
    stock, category} = req.body;
  dto.sizes = sizes.map((size)=> {
    return {size: size,
      stock: req.body[`stockOf${size}`],
    };
  });
  dto.images = Object.values(req.files).map((file) => file.filename);
  dto.lastEditedBy = req.session.admin.firstName;
  await productServices.createNewProduct(dto);
  res.json({success: true});
});

exports.changeProductCODStatus = catchAsync(async (req, res, next)=> {
  const status = await productServices.updateCODStatus(req.body.id);
  res.json({success: true, status});
});

exports.changeProductActiveStatus = catchAsync(async (req, res, next)=> {
  const status = await productServices.updateActiveStatus(req.body.id);
  res.json({success: true, status});
});

exports.getEditProductPage = catchAsync(async (req, res, next)=> {
  const product = await productServices.getProductById(req.params.id);
  res.render('admins/edit-product', {product});
});

exports.updateProduct = catchAsync(async (req, res, next)=> {
  // destructuring and repository layer need  to be checked
  const dto = {
    name,
    designCode,
    gender,
    sizes,
    exactColor,
    broadColor,
    price,
    stock,
    category,
  } = req.body;

  dto.lastEditedBy = req.session.admin.firstName;

  dto.sizes = sizes.map((size)=> {
    return {size: size,
      stock: req.body[`stockOf${size}`],
    };
  });

  const images = Object.values(req.files).map((file) => file.filename);

  await productServices.updateProduct(
      req.body.id,
      dto,
      images,
  );

  res.json({success: true});
});

