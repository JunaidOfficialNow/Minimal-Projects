/* eslint-disable require-jsdoc */
const UserRepository = require('../repositories/user.repository');

const emailServices = require('../utils/emails/email.helpers');

const bcrypt = require('bcrypt');
const crypto = require('crypto');

class UserServices {
  #repo;
  #emailServices;
  constructor(repo, emailServices) {
    this.#repo = repo;
    this.#emailServices = emailServices;
  }

  async getAllUsers() {
    return await this.#repo.getAllUsers();
  }

  async updateUserBlockStatus(id, isBlocked) {
    return await this.#repo.updateUserById(id, {isBlocked});
  }

  async getUserByEmail(email) {
    return await this.#repo.getUserByEmail(email);
  }

  async handleEmail(email) {
    const user = await this.getUserByEmail(email);
    if (user) throw new Error('Email is already in use');
    try {
      const otp = await this.#emailServices.sendOtp(email);
      console.log(otp);
      return otp;
    } catch (error) {
      // eslint-disable-next-line max-len
      throw new Error('There was a trouble sending the otp, please try again later');
    }
  }

  async createAccount(userDetails, password) {
    const pass = await bcrypt.hash(password, 10);
    userDetails.hashPassword = pass;
    const user = await this.#repo.addNewUser(userDetails);
    return user;
  }

  async resendOtp(email) {
    return await this.#emailServices.resendOtp(email);
  }

  async verifyToken(token) {
    const user = await this.#repo.getUserByToken(token);
    if (!user) throw new Error('Invalid token');
    return user;
  }

  async resetPassword(token, newPassword) {
    const user = await this.verifyToken(token);
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    user.hashPassword = newHashPassword;
    user.token = undefined;
    await this.#repo.saveDocument(user);
  }

  async validatePassword(token, newPassword) {
    const user = await this.verifyToken(token);
    const result = await bcrypt.compare(newPassword, user.hashPassword);
    if (result) throw new Error('New password can\'t be your old password');
  }

  async sendResetToken(email) {
    const user = await this.getUserByEmail(email);
    if (!user) throw new Error('No user with email ' + email);
    const token = crypto.randomBytes(20).toString('hex');
    await this.#emailServices.sendUrl(email, token);
    user.token = token;
    await this.#repo.saveDocument(user);
  }
}

module.exports = new UserServices(
    UserRepository.getInstance(),
    emailServices,
);
