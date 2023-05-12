const bannerServices = require('../../services/banner.services');

const catchAsync = require('../../utils/error-handlers/catchAsync.handler');


exports.getBannersPage =catchAsync(async (req, res, next) => {
  const banners = await bannerServices.getAllBanners();
  res.render('admins/banners.ejs', {
    admin: req.session.admin,
    banners,
  });
});

exports.getEditBannersPage = catchAsync(async (req, res, next) => {
  const banner = await bannerServices.getBannerByName(req.params.name);
  res.render('admins/edit-banner', {
    admin: req.session.admin,
    banner,
  });
});

exports.updateBanners = catchAsync(async (req, res, next)=> {
  if (req.file) req.body.image = req.file.filename;
  const {id, ...details} = req.body;
  await bannerServices.updateBannerById(id, details);
  res.redirect('/admin/banners');
});

exports.checkNameExists = catchAsync(async (req, res, next)=> {
  // there is a bug that will send 500 error page if name exists;
  await bannerServices.checkBannerExistsByName(req.params.name);
  return res.json({success: true});
});


