/* eslint-disable require-jsdoc */

const categoryServices = require('../../services/category.services');
const designServices = require('../../services/design.services');

const catchAsync = require('../../utils/error-handlers/catchAsync.handler');


exports.addCategory = catchAsync(async (req, res, next)=>{
  const {name, description} = req.body;
  if (name == '' || description == '') {
    // in the frontend need  to change the error messsage.
    res.json({message: 'All fields are required'});
  } else {
    await categoryServices.checkCategoryExistsByName(name);
    req.session.addCategory = {name, description};
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
  const doc = await categoryServices.addCategoryImage(addCategory);
  delete req.session.addCategory;
  res.json({success: true, doc});
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const category = await categoryServices.getAllCategories();
  res.json(category);
});


// need to move this functions of deleteCategory to somewher in the future.
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const data = await categoryServices.deleteCategory(req.body.id);
  await designServices.deleteAllOfTheCategory(data.name);
  await categoryServices.deleteCategory(data.image, data.name);
  res.json({success: true});
});

exports.deactivateCategory = catchAsync(async (req, res, next) => {
  const doc = await categoryServices.updateCategoryStatus(req.body.id, false);
  res.json({
    success: true,
    date: doc.updatedAt,
    by: doc.lastEditedBy,
  });
});

exports.activateCategory = catchAsync(async (req, res, next) => {
  const doc = await categoryServices.updateCategoryStatus(req.body.id, true);
  res.json({
    success: true,
    date: doc.updatedAt,
    by: doc.lastEditedBy,
  });
});

exports.getCategoryDetails = catchAsync(async (req, res, next) => {
  const category = await categoryServices.getCategoryDetails(req.body.id);
  return res.json({success: true, category});
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const {name, description, id} = req.body;
  const category = await categoryServices.editCategory(name, description, id);
  res.json({
    success: true,
    image: category.image,
    id: category.id,
    date: category.updatedAt,
    by: category.lastEditedBy,
  });
});

exports.categoryImageUpdate = catchAsync(async (req, res, next) => {
  const {id, image} = req.body;
  const newImage = await categoryServices.catImageUpdate(
      id,
      image,
      req.file.filename,
  );
  return res.json({success: true, newImage});
});

exports.getCategoryNames = catchAsync(async (req, res, next)=> {
  const categories = await categoryServices.getAllCategoryNames();
  res.json({success: true, categories});
});
