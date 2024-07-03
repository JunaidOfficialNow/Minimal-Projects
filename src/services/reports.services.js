/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const OrderRepository = require('../repositories/order.repository');
const createCSV = require('../utils/createCSV');

class ReportsServices {
  #orderRepo;
  constructor(orderRepo) {
    this.#orderRepo = orderRepo;
  }

  async getDashboardDatas() {
    const todaySale = await this.todaySale();
    const totalSale = await this.totalSale();
    return {
      todaySale: todaySale.length > 0 ? todaySale : [{todaySale: 0, todayRevenue: 0}],
      totalSale: totalSale.length > 0 ? totalSale : [{totalSales: 0, totalRevenue: 0}],
    };
  }

  async getSalesAndRevenueDatas() {
    const sales = await this.salesAndRevenueChart();
    const size = await this.sizeAndSaleReport();
    return {sales, size};
  }

  async getOrderReportCSV(status) {
    const orders = await this.#orderRepo.getOrderByStatus(status);
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

    return await this.#orderRepo.todaySale(startOfDay, endOfDay);
  }

  async totalSale() {
    return await this.#orderRepo.totalSale();
  }

  async salesAndRevenueChart() {
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
    sevenMonthsAgo.setHours(0, 0, 0, 0);
    return await this.#orderRepo.salesAndRevenueChart(sevenMonthsAgo);
  }


  async sizeAndSaleReport() {
    const currentDate = new Date();
    const sevenMonthsAgo = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 6, 1,
    );
    return await this.#orderRepo.sizeAndSaleReport(sevenMonthsAgo);
  }
}

module.exports = new ReportsServices(
    OrderRepository.getInstance(),
);
