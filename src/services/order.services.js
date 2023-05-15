/* eslint-disable require-jsdoc */
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');

const createCSV = require('../utils/createCSV');

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

  async getOrdersByStatus(status) {
    return await this.#repo.getOrderByStatus(status);
  }

  async getOrderReportCSV(status) {
    const orders = await this.getOrdersByStatus(status);
    if (!orders.length) throw new Error('No records to download');
    const path = 'orders.csv';
    const header = [
      {id: 'orderId', title: 'Order ID'},
      {id: 'userId', title: 'Customer ID'},
      {id: 'status', title: 'Status'},
      {id: 'paymentMethod', title: 'payment'},
      {id: 'coupon', title: 'Coupon'},
      {id: 'discount', title: 'dicount'},
      {id: 'subTotal', title: 'Sub Total'},
      {id: 'totalAmount', title: 'Total Amount'},
    ];
    await createCSV(path, header, orders);
    return path;
  }

  async todaySale() {
    const today = new Date();
    const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23, 59, 59,
    );

    return await this.#repo.todaySale(startOfDay, endOfDay);
  }

  async totalSale() {
    return await this.#repo.totalSale();
  }

  async salesAndRevenueChart() {
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
    sevenMonthsAgo.setHours(0, 0, 0, 0);
    return await this.#repo.salesAndRevenueChart(sevenMonthsAgo);
  }

  async sizeAndSaleReport() {
    const currentDate = new Date();
    const sevenMonthsAgo = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 6, 1,
    );
    return await this.#repo.sizeAndSaleReport(sevenMonthsAgo);
  }
};

module.exports = new OrderServices(
    new OrderRepository(
        orderModel,
        productModel,
        userModel,
    ),
);
