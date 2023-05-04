/* eslint-disable require-jsdoc */
const designModel = require('../models/design.model');
const DesignRepository = require('../repositories/design.repository');

class DesignServices {
  constructor(designRepo) {
    this.repo = designRepo;
  }

  async deleteAllOfTheCategory(categoryName) {
    this.repo.deleteAllOfTheCategory(categoryName);
  }
};


module.exports = new DesignServices(new DesignRepository(designModel));
