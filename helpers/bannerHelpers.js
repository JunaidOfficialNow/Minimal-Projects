const Banner = require('../models/bannerModel');

const getBanners = async () => {
  return await Banner.find();
};

const getBanner = async (name) => {
  return await Banner.findOne({name: name});
};

const updateBanner = async (id, details) => {
  await Banner.findByIdAndUpdate(id, details);
};

const add = async () => {
  await Banner.create({name: 'addd'});
};

module.exports = ({
  getBanners,
  getBanner,
  updateBanner,
  add,
});
