const Design = require('../../models/designModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const fs = require('fs');
const path = require('path');

exports.getDesignCategory = async (req, res) => {
  const category = await Design.find({});
  res.render('admins/admin-design',
      {admin: req.session.admin, category});
};

exports.getAddDesignCategory = (req, res, next) => {
  Category.find({}).select('name -_id').then((category)=> {
    res.render('admins/add-design', {category: category});
  }).catch((error)=> next(error));
};

exports.AddDesignCategory = async (req, res, next) => {
  try {
    // need to check the contents of req.body here because
    // it was updated later
    const details = {
      ...req.body,
      image: req.file.filename,
      lastEditedBy: req.session.admin.firstName,
    };
    const dir = path.join(__dirname,
        '../public', 'static', 'uploads', category, designCode);
    fs.mkdir(dir, async (err) => {
      if (err) {
        throw new Error('There was an error while creating the category');
      } else {
        await Design.create(details);
        res.redirect('/admin/design/category');
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.checkCodeExists = (req, res, next)=> {
  Design.findOne({designCode: req.body.code}).then((doc)=> {
    if (doc) {
      res.json({});
    } else res.json({success: true});
  }).catch((err)=> next(err));
};

exports.getDesignCodes = (req, res, next) => {
  Design.distinct('designCode').then((doc)=> {
    res.json({success: true, codes: doc});
  }).catch((err)=> next(err));
};

exports.changeDesignStatus = async (req, res, next)=> {
  try {
    const design = await Design.findById(req.body.id);
    let status;
    if (design) {
      design.isActive = !design.isActive;
      const newDesign = await design.save();
      status = {status: newDesign.isActive,
        code: newDesign.designCode};
    } else {
      throw new Error('No design document found');
    }
    await Product.updateMany(
        {designCode: status.code},
        {$set: {isActive: status.status}},
    );
    res.json({success: true, status: status.status});
  } catch (error) {
    next(error);
  };
};

