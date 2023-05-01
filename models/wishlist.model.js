const {Schema, model} = require('mongoose');

const productsSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'products',
  },
});

const wishlistSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  products: {
    type: [productsSchema],
    required: true,
  },
});

module.exports = model('wishlists', wishlistSchema);
