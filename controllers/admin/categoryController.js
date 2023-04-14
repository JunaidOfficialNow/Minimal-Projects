/* eslint-disable require-jsdoc */
const categoryHelpers = require('../../helpers/categoryHelpers');
const Category = require('../../models/categoryModel');
const Design = require('../../models/designModel');
const fs = require('fs');
const path = require('path');

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

exports.addCategory = (req, res, next)=>{
  const {name, description} = req.body;
  if (name == '' || description == '') {
    res.json({message: 'All fields are required'});
  } else {
    categoryHelpers.checkCategoryExists(name).then(()=>{
      req.session.addCategory = {name: name, description: description};
      res.json({success: true});
    }).catch((error)=>next(error));
  };
};

exports.addCatImage = (req, res, next)=>{
  try {
    if (!req.file) {
      throw new Error('Image is required');
    }
    const addCategory = req.session.addCategory;
    addCategory.image = req.file.filename;
    addCategory.lastEditedBy = req.session.admin.firstName;
    // eslint-disable-next-line max-len
    fs.mkdir(path.join(__dirname, `../public/static/uploads/${addCategory.name}`),
        (error)=> {
          if (error) {
            res.json({success: false});
          } else {
            Category.create(addCategory).then((doc)=>{
              delete req.session.addCategory;
              res.json({success: true, doc});
            });
          }
        });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = (req, res, next) => {
  Category.find({}).then((category)=> {
    res.json(category);
  }).catch((err)=>{
    next(err);
  });
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const data = await Category.findByIdAndRemove(req.body.id);
    await Design.deleteMany({category: data.name});
    fs.unlink('public/uploads/category/'+data.image, (error)=> {
      if (error) {
      }
    });
    const directory =
      path.join(__dirname, '../public', 'uploads', data.name);
    deleteDirectory(directory);
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};

exports.deactivateCategory = (req, res, next) => {
  Category.findByIdAndUpdate(req.body.id, {isActive: false},
      {new: true}).then((doc)=>{
    if (doc) {
      res.json({success: true, date: doc.updatedAt, by: doc.lastEditedBy});
    } else {
      throw new Error('Category may have already deleted');
    };
  }).catch((err) => {
    next(err);
  });
};

exports.activateCategory = (req, res, next) => {
  Category.findByIdAndUpdate(req.body.id, {isActive: true},
      {new: true}).then((doc)=>{
    if (doc) {
      res.json({success: true, date: doc.updatedAt, by: doc.lastEditedBy});
    } else {
      throw new Error('Category may have already deleted');
    };
  }).catch((err) => {
    next(err);
  });
};

exports.getCategoryDetails = (req, res, next) => {
  Category.findById(req.body.id).then((doc)=> {
    if (doc) {
      return res.json({success: true, category: doc});
    }
    throw new Error('Category may have deleted');
  }).catch((err)=>{
    next(err);
  });
};

exports.updateCategory = async (req, res, next) => {
  try {
    const {name, description, id} = req.body;
    const details = {description};
    const oldName = await categoryHelpers.checkCategoryExistsById(id);
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
          categoryHelpers.checkCategoryExists(name).then(() => {
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
  fs.unlink('public/uploads/category/'+image);
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

exports.getCategoryNames = (req, res, next)=> {
  Category.find({}).select('name -_id').then((category)=> {
    res.json({success: true, categories: category});
  }).catch((err)=>{
    next(err);
  });
};
