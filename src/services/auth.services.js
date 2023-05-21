/* eslint-disable require-jsdoc */

const AdminRepository = require('../repositories/admin.repository');
const UserRepository = require('../repositories/user.repository');


const emailServices = require('../utils/emails/email.helpers');


const bcrypt = require('bcrypt');
const UserNotFound = require('../utils/error-handlers/userNotFound');
const UnAuthorizedException = require('../utils/error-handlers/unAuthorized');

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
    if (!await bcrypt.compare(plainPassword, hashPassword)) {
      throw new UnAuthorizedException('Incorrect password or email');
    }
  }

  async adminLogin(plainPassword, email) {
    const admin = await this.#adminRepo.getAdminByEmail(email);
    if (!admin) throw new UserNotFound(`No admin found for ${email}`);
    await this.verifyPassword(plainPassword, admin.hashPassword);
    const otp = await this.#emailServices.sendOtp(email);
    return {admin, otp};
  }

  async resendOtp(email) {
    return await this.#emailServices.resendOtp(email);
  }

  async userLogin(email, password) {
    const user = await this.#userRepo.getUserByEmail(email);
    if (!user) throw new UserNotFound();
    if (!user.isBlocked) throw new UnAuthorizedException('Account is blocked');
    await this.verifyPassword(password, user.hashPassword);
    return user;
  }
}

module.exports = new AuthServices(
    AdminRepository.getInstance(),
    UserRepository.getInstance(),
    emailServices,
);
