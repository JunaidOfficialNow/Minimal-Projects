/* eslint-disable require-jsdoc */

const AdminRepo = require('../repositories/admin.repository');
const adminModel = require('../models/admin.model');

const emailServices = require('../utils/emails/email.helpers');


const bcrypt = require('bcrypt');

class AuthServices {
  #adminRepo;
  #userRepo;
  #emailServices;
  constructor(adminRepo, userRepo, emailServices) {
    this.#adminRepo = adminRepo;
    this.#userRepo = userRepo;
    this.#emailServices = emailServices;
  }

  async verifyPassword(plainPassword, hashPassword) {
    return await bcrypt.compare(plainPassword, hashPassword);
  }

  async adminLogin(plainPassword, email) {
    const admin = await this.#adminRepo.getAdminByEmail(email);
    if (!admin) throw new Error(`No admin found for ${email}`);
    if (! await this.verifyPassword(plainPassword, admin.hashPassword)) {
      throw new Error('Incorrect Password');
    }
    const otp = await this.#emailServices.sendOtp(email);
    return {admin, otp};
  }

  async resendOtp(email) {
    return await this.#emailServices.resendOtp(email);
  }
}

module.exports = new AuthServices(
    new AdminRepo(adminModel),
    null,
    emailServices,
);
