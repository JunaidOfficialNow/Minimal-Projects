const Product = require('../models/productModel');

module.exports = {
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
