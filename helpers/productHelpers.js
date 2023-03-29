const Product = require('../models/productModel');

module.exports = {
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
};
