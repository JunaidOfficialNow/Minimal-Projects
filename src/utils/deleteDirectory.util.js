/* eslint-disable require-jsdoc */
module.exports = async function deleteDirectory(directory) {
  try {
    const folders = await readdirPromised(directory);
    for (const folder of folders) {
      const files = await readdirPromised(path.join(directory, folder));
      for (const file of files) {
        await unlinkPromised(path.join(directory, folder, file));
      }
      await rmdirPromised(path.join(directory, folder));
    }
    await rmdirPromised(directory);
  } catch (err) {
  }
};


const readdirPromised = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
};

const unlinkPromised = (file) => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

const rmdirPromised = (dir) => {
  return new Promise((resolve, reject) => {
    fs.rmdir(dir, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
