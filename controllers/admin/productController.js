const Product = require('../../models/productModel');
const Design = require('../../models/designModel');

exports.getProductsPage = (req, res, next) => {
  Product.find().then((products)=> {
    res.render('admins/admin-products', {admin: req.session.admin,
      products: products});
  }).catch((err)=> next(err));
};

exports.addProductName = (req, res) => {
  const {name, designCode} = req.body;
  req.session.addProduct = {
    name: name,
    designCode: designCode,
  };
  res.json({success: true});
};

exports.getAddProductPage = (req, res, next) => {
  const {name, designCode} = req.session.addProduct;
  Design.findOne({designCode}).then((doc)=>{
    res.render('admins/admin-add-product', {name: name, doc});
  }).catch((err)=> next(err));
};

exports.addProductAll = async (req, res, next)=> {
  // need to check the req.body here and use destructuring properly
  try {
    const {name, designCode, gender, sizes, exactColor, broadColor, price,
      stock, category} = req.body;
    const newSizes = sizes.map((size)=> {
      return {size: size,
        stock: req.body[`stockOf${size}`],
      };
    });
    const imageArray = Object.values(req.files).map((file) => file.filename);
    const details = {
      name: name,
      designCode: designCode,
      gender: gender,
      sizes: newSizes,
      exactColor: exactColor,
      broadColor: broadColor,
      stock: stock,
      category: category,
      price: price,
      images: imageArray,
      lastEditedBy: req.session.admin.firstName,
    };
    const product = new Product(details);
    await product.save();
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};

exports.changeProductCODStatus = async (req, res, next)=> {
  try {
    const product = await Product.findById(req.body.id);
    if (product) {
      product.isCodAvailable = !product.isCodAvailable;
      const newProduct = await product.save();
      res.json({success: true, status: newProduct.isCodAvailable});
    } else {
      throw new Error('Couldn\'t find product');
    }
  } catch (error) {
    next(error);
  }
};

exports.changeProductActiveStatus = async (req, res, next)=> {
  try {
    const product = await Product.findById(req.body.id);
    product.isActive = !product.isActive;
    const newProduct = await product.save();
    res.json({success: true, status: newProduct.isActive});
  } catch (error) {
    next(error);
  };
};

exports.getEditProductPage = (req, res, next)=> {
  Product.findById(req.params.id).then((product)=> {
    res.render('admins/edit-product', {product});
  }).catch((error)=> next(error));
};

exports.updateProduct = async (req, res, next)=> {
  try {
    // destructuring and repository layer need  to be checked
    const {name, id, designCode, gender, sizes, exactColor, broadColor, price,
      stock, category} = req.body;
    const newSizes = sizes.map((size)=> {
      return {size: size,
        stock: req.body[`stockOf${size}`],
      };
    });
    const imageArray = Object.values(req.files).map((file) => file.filename);
    const details = {
      name: name,
      designCode: designCode,
      gender: gender,
      sizes: newSizes,
      exactColor: exactColor,
      broadColor: broadColor,
      stock: stock,
      category: category,
      price: price,
      lastEditedBy: req.session.admin.firstName,
    };
    const product = await Product.findByIdAndUpdate(id, details, {new: true});
    imageArray.forEach((image)=> {
      product.images.push(image);
    });
    await product.save();
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};

