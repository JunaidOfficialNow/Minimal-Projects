/* eslint-disable require-jsdoc */
const designModel = require('../models/design.model');
const DesignRepository = require('../repositories/design.repository');

const path = require('path');
const fs = require('fs');
class DesignServices {
  #repo;
  constructor(designRepo) {
    this.#repo = designRepo;
  }

  async deleteAllOfTheCategory(categoryName) {
    this.#repo.deleteAllOfTheCategory(categoryName);
  }

  async getAllDesigns() {
    return await this.#repo.getAllDesigns();
  }

  async createNewDesign(data) {
    try {
      const dir = path.join(
          'src', 'public', 'static', 'uploads', data.category, data.designCode,
      );
      await fs.promises.mkdir(dir, ()=> {});
    } catch (error) {
      throw new Error('There was an error while creating the category');
    };
    await this.#repo.createNewDesign(data);
  }

  async checkCodeExists(designCode) {
    const doc = await this.#repo.getDesignByCode(designCode);
    if (doc) throw new Error(`Design ${designCode} already exists`);
  }

  async getUniqueDesigns() {
    return await this.#repo.getUniqueDesigns();
  }

  async updateDesignStatus(id) {
    const doc = await this.#repo.getDesignById(id);
    if (!doc) throw new Error('Design code might already have been deleted');
    doc.isActive = !doc.isActive;
    const {isActive, designCode} = await doc.save();
    return {designCode, isActive};
  }
};


module.exports = new DesignServices(new DesignRepository(designModel));
