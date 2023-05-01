const Product = require('../../models/product.model');
const Design = require('../../models/design.model');
const Category = require('../../models/category.model');
const mongoose = require('mongoose');

exports.getShopPage = async (req, res, next)=> {
  try {
    const categoryNames = await Category.find({}).select('name -_id');
    // need to merge these 2 queries into one  query
    const colors = await Design.distinct('colors');
    const sizes = await Design.distinct('sizes');
    const count = await Product.count();
    const products =
    await Product.find().limit(9).skip((req.query.page-1)*9);
    res.render('users/user-product', {
      user: req.session.user,
      products, count,
      page: 'shop',
      categoryNames,
      colors: colors.slice(0, 10),
      sizes,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductPage = async (req, res, next)=> {
  try {
    const id = req.params.id;
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      throw new Error('Tried to change the id value , huh?');
    };
    // eslint-disable-next-line max-len
    const colors = await Design.find({designCode: product.designCode}).select('colors -_id');
    // larege queries: needs to move to somewhere
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
    res.render('users/single-product', {
      user: req.session.user,
      product,
      colors: colors[0].colors,
      page: 'shop',
      categoryRelatedProducts,
      colorRelatedProduct,
      designRelatedProduct,
    });
  } catch (error) {
    next(error);
  };
};

exports.getCertainProducts = async (req, res)=> {
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
};

exports.getSearchResults = async (req, res) => {
  const {type, value} = req.params;
  if (type === 'category') {
    const categories =
     await Product.find({
       category: {
         $regex: new RegExp(value, 'i'),
       },
     }).distinct('category');
    return res.json({success: true, categories});
  }
  if (type === 'products') {
    const products =
     await Product.find({
       name:
        {
          $regex: new RegExp(value, 'i'),
        },
     }).distinct('name');
    return res.json({success: true, products: products.slice(0, 5)});
  }
  if (type === 'colors') {
    const exactColors =
    await Product.find({
      exactColor:
      {
        $regex: new RegExp(value, 'i'),
      },
    }).distinct('exactColor');
    const broadColors =
  await Product.find({
    broadColor:
     {
       $regex: new RegExp(value, 'i'),
     },
  }).distinct('broadColor');
    const colors = [...new Set([...exactColors, ...broadColors])];
    return res.json({success: true, colors});
  }
  if (type === 'genders') {
    const genders = await Product.find({
      gender:
        {
          $regex: new RegExp(value, 'i'),
        },
    }).distinct('gender');
    return res.json({success: true, genders});
  }
  res.json({success: true});
};
// needs to refactor all these queries
// needs to  find count  and products in one aggregation
exports.getResults = async (req, res) => {
  const {type, value} = req.params;
  const page = req.query.page;
  let products;
  let count;
  if (type === 'products') {
    products = await Product.find({name: value}).skip((page -1)* 9).limit(9);
    count = await Product.find({name: value}).count();
  } else if (type === 'category') {
    products = await Product
        .find({category: value})
        .skip((page -1)* 9)
        .limit(9);
    count = await Product.find({category: value}).count();
  } else if (type === 'colors') {
    products = await Product
        .find({
          $or: [
            {exactColor: value},
            {broadColor: value},
          ],
        })
        .skip((page -1)* 9)
        .limit(9);
    count = await Product.find({
      $or: [
        {exactColor: value},
        {broadColor: value},
      ],
    }).count();
  } else if (type === 'genders') {
    products = await Product
        .find({gender: value})
        .skip((page -1)* 9)
        .limit(9);
    count = await Product.find({gender: value}).count();
  };
  const categoryNames = await Category.find({}).select('name -_id');
  const colors = await Design.distinct('colors');
  const sizes = await Design.distinct('sizes');
  const pageName = `results/${type}/${value}`;
  const user = req.session.user;
  res.render('users/user-product', {
    user,
    products,
    count,
    page: pageName,
    categoryNames,
    colors: colors.slice(0, 10),
    sizes,
  });
};
