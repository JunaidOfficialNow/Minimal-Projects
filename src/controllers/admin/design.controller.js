const designServices = require('../../services/design.services');
const categoryServices = require('../../services/category.services');
const productServices = require('../../services/product.services');

const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

exports.getDesignCategory = catchAsync(async (req, res, next) => {
  const categories = await designServices.getAllDesigns();
  res.render('admins/admin-design', {
    admin: req.session.admin,
    category: categories,
  });
});

exports.getAddDesignCategory = catchAsync(async (req, res, next) => {
  const categories = await categoryServices.getAllCategoryNames();
  res.render('admins/add-design', {category: categories});
});

exports.AddDesignCategory = catchAsync(async (req, res, next) => {
  // need to check the contents of req.body here because
  // it was updated later
  const details = {
    ...req.body,
    image: req.file.filename,
    lastEditedBy: req.session.admin.firstName,
  };
  await designServices.createNewDesign(details);
  res.redirect('/admin/design/category');
});

exports.checkCodeExists = catchAsync(async (req, res, next)=> {
  await designServices.checkCodeExists(req.body.code);
  res.json({success: true});
});

exports.getDesignCodes = catchAsync(async (req, res, next) => {
  // need to check if only codes names are used.
  // if  yes  need to update query with select operator;
  const codes = await designServices.getUniqueDesigns();
  res.json({success: true, codes});
});

exports.changeDesignStatus = catchAsync(async (req, res, next)=> {
  const data = await designServices.updateDesignStatus(req.body.id);
  await productServices.updateProductsStatusByDesign(
      data.designCode,
      data.isActive,
  );
  res.json({success: true, status: data.isActive});
});

