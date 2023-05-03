const createCsvWriter = require('csv-writer').createObjectCsvWriter;

module.exports = async function(path, header, data) {
  const csvWriter = createCsvWriter({
    path,
    header,
  });
  await csvWriter.writeRecords(data);
};
