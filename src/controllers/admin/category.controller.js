/* eslint-disable require-jsdoc */
const Category = require('../../models/category.model');
const fs = require('fs');
const path = require('path');

const categoryServices = require('../../services/category.services');
const designServices = require('../../services/design.services');

const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

function updateCategory(id, details, res, next) {
  Category.findByIdAndUpdate(id, details, {new: true}).then((doc)=> {
    if (doc) {
      return res.json({success: true, image: doc.image,
        id: doc.id, date: doc.updatedAt, by: doc.lastEditedBy});
    }
    throw new Error('Category may have deleted');
  }).catch((err)=> {
    next(err);
  });
}

async function deleteDirectory(directory) {
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
}

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

exports.addCategory = catchAsync(async (req, res, next)=>{
  const {name, description} = req.body;
  if (name == '' || description == '') {
    res.json({message: 'All fields are required'});
  } else {
    await categoryServices.checkCategoryExistsByName(name);
    req.session.addCategory = {name: name, description: description};
    res.json({success: true});
  };
});

exports.addCatImage = catchAsync(async (req, res, next)=>{
  if (!req.file) {
    throw new Error('Image is required');
  }
  const addCategory = req.session.addCategory;
  addCategory.image = req.file.filename;
  addCategory.lastEditedBy = req.session.admin.firstName;
  // eslint-disable-next-line max-len
  fs.mkdir(path.join(__dirname, `../../public/static/uploads/${addCategory.name}`),
      async (error)=> {
        if (error) {
          throw new Error('Oops! Something went wrong');
        } else {
          const doc = await categoryServices.createCategory(addCategory);
          delete req.session.addCategory;
          res.json({success: true, doc});
        }
      });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const category = await categoryServices.getAllCategories();
  res.json(category);
});


// need to move this functions of deleteCategory to somewher in the future.
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const data = await categoryServices.deleteCategory(req.body.id);
  await designServices.deleteAllOfTheCategory(data.name);
  fs.unlink('src/public/uploads/category/'+data.image, (error)=> {
    if (error) {
    }
  });
  const directory =
    path.join(__dirname, '../public', 'uploads', data.name);
  deleteDirectory(directory);
  res.json({success: true});
});

exports.deactivateCategory = catchAsync(async (req, res, next) => {
  const doc = await categoryServices.updateCategoryStatus(req.body.id, false);
  if (doc) {
    res.json({
      success: true,
      date: doc.updatedAt,
      by: doc.lastEditedBy,
    });
  } else {
    throw new Error('Category may have already been deleted');
  };
});

exports.activateCategory = catchAsync(async (req, res, next) => {
  const doc = await categoryServices.updateCategoryStatus(req.body.id, true);
  if (doc) {
    res.json({
      success: true,
      date: doc.updatedAt,
      by: doc.lastEditedBy,
    });
  } else {
    throw new Error('Category may have already deleted');
  };
});

exports.getCategoryDetails = catchAsync(async (req, res, next) => {
  const category = await categoryServices.getCategoryDetails(req.body.id);
  return res.json({success: true, category});
});

exports.updateCategory = async (req, res, next) => {
  try {
    const {name, description, id} = req.body;
    const details = {description};
    const oldName = await categoryServices.getOldCategoryName(id);
    if (oldName !== name) {
      details.name = name;
      const oldPath =
        path.join(__dirname, '../public', 'uploads', oldName);
      const newPath =
        path.join(__dirname, '../public', 'uploads', name);
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          throw new Error('There is trouble updating category name  now');
        } else {
          categoryServices.checkCategoryExistsByName(name).then(() => {
            updateCategory(id, details, res, next);
          });
        }
      });
    } else {
      updateCategory(id, details, res, next);
    };
  } catch (error) {
    next(error);
  }
};

exports.categoryImageUpdate = (req, res, next) => {
  const {id, image} = req.body;
  // need to add some alternatives ot
  // handle the error cases of deleting the old image
  fs.unlink('src/public/uploads/category/'+image);
  Category.findByIdAndUpdate(id, {image: req.file.filename},
      {new: true}).then((doc)=> {
    if (doc) {
      return res.json({success: true, newImage: doc.image});
    }
    throw new Error('Category may have already deleted');
  }).catch((err)=>{
    next(err);
  });
};

exports.getCategoryNames = catchAsync(async (req, res, next)=> {
  const categories = await categoryServices.getAllCategoryNames();
  res.json({success: true, categories});
});
