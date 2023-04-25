const Banner = require('../../models/bannerModel');


exports.getBannersPage = async (req, res) => {
  const banners = await Banner.find();
  res.render('admins/banners.ejs',
      {admin: req.session.admin, banners});
};

exports.getEditBannersPage = async (req, res) => {
  const banner = await Banner.findOne({name: req.params.name});
  res.render('admins/edit-banner', {admin: req.session.admin, banner});
};

exports.updateBanners = async (req, res, next)=> {
  try {
    if (req.file) {
      req.body.image = req.file.filename;
    }
    const {id, ...details} = req.body;
    await Banner.findByIdAndUpdate(id, details);
    res.redirect('/admin/banners');
  } catch (error) {
    next(error);
  }
};

exports.checkNameExists = (req, res, next)=> {
  Banner.findOne({name: req.params.name}).then((banner)=> {
    if (banner) {
      return res.json({exists: true});
    }
    return res.json({exists: false});
  }).catch((err)=> next(err));
};


