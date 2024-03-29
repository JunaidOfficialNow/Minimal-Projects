const multer = require('multer');
const path = require('path');
const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const Categorystorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    uploadError.status = 400;
    // eslint-disable-next-line max-len
    const dir = path.join( 'src', './public', 'static', 'uploads', 'category');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, dir);
  },
  filename: function(req, file, cb) {
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`);
  },
});

const DesignStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    uploadError.status = 400;

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, './src/public/static/uploads/designs');
  },
  filename: function(req, file, cb) {
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`);
  },
});

const ProductStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    uploadError.status = 400;
    const {category, designCode} = req.body;
    console.log('inside multer');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, `./src/public/static/uploads/${category}/${designCode}`);
  },
  filename: function(req, file, cb) {
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`);
  },
});

const ProfileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    uploadError.status = 400;

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, `./src/public/static/uploads/profiles`);
  },
  filename: function(req, file, cb) {
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`);
  },
});

const BannerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    uploadError.status = 400;
    console.log('inside multer');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, `./src/public/static/uploads/banners`);
  },
  filename: function(req, file, cb) {
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename.split('.')[0]}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({storage: Categorystorage});
const DesignUpload = multer({storage: DesignStorage});
const ProductUpload = multer({storage: ProductStorage});
const ProfileUpload = multer({storage: ProfileStorage});
const BannerUpload = multer({storage: BannerStorage});


module.exports = {
  uploadOptions,
  DesignUpload,
  ProductUpload,
  ProfileUpload,
  BannerUpload,
};

