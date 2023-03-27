const Product = require('../models/productModel');

module.exports = {
  getColorsNames: async (value) => {
    const exactColors =
         await Product.find({exactColor: {$regex: new RegExp(value, 'i')}})
             .distinct('exactColor');

    const broadColors =
  await Product.find({broadColor: {$regex: new RegExp(value, 'i')}})
      .distinct('broadColor');

    return [...new Set([...exactColors, ...broadColors])];
  },
  getGendersNames: async (value)=> {
    return await Product.find({gender: {$regex: new RegExp(value, 'i')}})
        .distinct('gender');
  },
  getCategoryProducts: async (value, page) => {
    return await Product.find({category: value}).skip((page -1)* 9).limit(9);
  },
  getProductsProducts: async (value, page)=> {
    return await Product.find({name: value}).skip((page -1)* 9).limit(9);
  },
  getColorsProducts: async (value, page)=> {
    return await Product.find({$or: [{exactColor: value},
      {broadColor: value}]}).skip((page -1)* 9).limit(9);
  },
  getGendersProducts: async (value, page) => {
    return await Product.find({gender: value}).skip((page -1)* 9).limit(9);
  },
  getProductsProductsCount: async (value)=> {
    return await Product.find({name: value}).count();
  },
  getCategoryProductsCount: async (value)=> {
    return await Product.find({category: value}).count();
  },
  getColorsProductsCount: async (value)=> {
    return await Product.find({$or: [{exactColor: value},
      {broadColor: value}]}).count();
  },
  getGendersProductsCount: async (value)=> {
    return await Product.find({gender: value}).count();
  },
  changeProductCODStatus: async (id) => {
    const product = await Product.findById(id);
    if (product) {
      product.isCodAvailable = !product.isCodAvailable;
      const newProduct = await product.save();
      return Promise.resolve(newProduct.isCodAvailable);
    } else {
      Promise.reject(new Error('Couldn\'t find product'));
    }
  },
  changeProductActiveStatus: async (id)=> {
    try {
      const product = await Product.findById(id);
      product.isActive = !product.isActive;
      const newProduct = await product.save();
      return Promise.resolve(newProduct.isActive);
    } catch (error) {
      // eslint-disable-next-line max-len
      return Promise.reject(new Error(`Error changing product status: ${error}`));
    };
  },
  updateProduct: async (id, details, images)=> {
    try {
      const product = await Product.findByIdAndUpdate(id, details, {new: true});
      images.forEach((image)=> {
        product.images.push(image);
      });
      await product.save();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getCategoryRelatedProducts: async (category) => {
    try {
      return await Product.aggregate([
        {
          $match: {category: category},
        },
        {
          $sample: {size: 2},
        },
      ]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getColorRelatedProduct: async (color)=> {
    try {
      return await Product.aggregate([
        {
          $match: {broadColor: color},
        },
        {
          $sample: {size: 1},
        },
      ]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getDesignRelatedProduct: async (designCode) => {
    try {
      return await Product.aggregate([
        {
          $match: {designCode: designCode},
        },
        {
          $sample: {size: 1},
        },
      ]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  updateDesignStatus: async (obj) => {
    try {
      const result = await Product.updateMany(
          {designCode: obj.code},
          {$set: {isActive: obj.status}},
      );
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
