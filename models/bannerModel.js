const {Schema, model} = require('mongoose');

const bannerSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  title: String,
  actionLink: String,
  description: String,
  actionText: String,
  image: String,
}, {timestamps: true});

module.exports = model('Banners', bannerSchema);
