/* eslint-disable */
window.addEventListener('DOMContentLoaded', function (e) {
  fetch('/admin/sales-and-revenue')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const xValues = [];
        const yValues = [];
        const yvaluesRevenue = [];
      
        const currentDate = new Date();

        for (let i = 6; i >= 0; i--) {
          const pastDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          const monthNumber = pastDate.getMonth() + 1;
          const monthName = pastDate.toLocaleString('default', {month: 'long'});
          const monthData = data.sales.find(data => data.month === monthNumber);
          const monthData2 = data.size.find(data => data.month === monthNumber);
          if (monthData) {
            xValues.push(monthName);
            yValues.push(monthData.totalSales);
            yvaluesRevenue.push(monthData.totalRevenue);
          } else {
            xValues.push(monthName);
            yValues.push(0);
            yvaluesRevenue.push(0);
          }
        }
        const ctx2 = document.getElementById('salse-revenue');
        const myChart2 = new Chart(ctx2, {
          type: 'line',
          data: {
            labels: xValues,
            datasets: [
              {
                label: 'Sales',
                data: yValues,
                backgroundColor: 'rgba(235, 22, 22, .7)',
                fill: true,
              },
              {
                label: 'Revenue',
                data: yvaluesRevenue,
                backgroundColor: 'rgba(235, 22, 22, .5)',
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
          },
        });
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

        const sizeGroups = new Map();

        for (const {size, year, month, totalSales} of data.size) {
          if (totalSales && year === currentDate.getFullYear()) {
            const monthKey = `${year}-${month}-${size}`;
            const existingData = sizeGroups.get(size) || {};
            const totalSalesForMonth = existingData[monthKey] || 0;
            existingData[monthKey] = totalSalesForMonth + totalSales;
            sizeGroups.set(size, existingData);
          }
        }

        const datasets = [];
        for (const [size, sizeData] of sizeGroups.entries()) {
          const salesData = [];
          for (let i = 0; i < 7; i++) {
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - i,
              1
            );
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthKey = `${year}-${month}-${size}`;
            const totalSales = sizeData[monthKey] || 0;
            salesData.unshift(totalSales);
          }
          datasets.push({
            label: `Size ${size}`,
            data: salesData,
            backgroundColor: `rgba(255, 22, 22, 0.${
              Math.floor(Math.random() * 5) + 5
            })`,
            borderColor: `rgba(255, 22, 22, 1)`,
            borderWidth: 1,
            fill: true,
            lineTension: 0,
            pointRadius: 0,
          });
        }

        datasets.reverse();

        const chartData = {
          labels: [],
          datasets: datasets,
        };

        for (let i = 0; i < 7; i++) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          const monthName = monthNames[date.getMonth()];
          chartData.labels.unshift(monthName);
        }

        const ctx = document.getElementById('worldwide-sales').getContext('2d');
        const myChart = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    });
});
