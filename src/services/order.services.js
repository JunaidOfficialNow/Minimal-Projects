/* eslint-disable require-jsdoc */
const OrderRepository = require('../repositories/order.repository');


class OrderServices {
  #repo;
  constructor(orderRepo) {
    this.#repo = orderRepo;
  }

  async getAllOrders() {
    return await this.#repo.getAllOrders();
  }

  async getOrderById(id) {
    const order = await this.#repo.getOrderById(id);
    if (!order) throw new Error(`Order ${id} not found`);
    return order;
  }

  async changeOrderStatus(id, status) {
    return await this.#repo.changeOrderStatus(id, status);
  }

  async getRecentOrders() {
    return await this.#repo.getRecentOrders();
  }
};

module.exports = new OrderServices(
    OrderRepository.getInstance(),
);
