const morgan = require('morgan');
const path = require('path');
const cookieparser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

// eslint-disable-next-line require-jsdoc
function checkCheckoutToken(req, res, next) {
  if (req.path.startsWith('/static/')) {
    return next();
  }
  if (req.session.checkOutToken) {
    if (!req.path.startsWith('/user/checkout/') &&
     !req.path.startsWith('/user/cart')) {
      delete req.session.checkOutToken;
    }
  }
  next();
}
// eslint-disable-next-line require-jsdoc
function nocache(_, res, next) {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
};
const sessionStore = new MongoStore({
  uri: process.env.MONGO_URL,
  collection: 'sessions',
});

module.exports = (app, express)=>{
  // setting application level settings
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'ejs');

  // setting middlewares
  app.use(morgan('dev'));
  app.use(cors());
  app.use(cookieparser());
  app.use(nocache);
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(express.json({limit: '10mb'}));
  app.use(express.urlencoded({limit: '10mb', extended: false}));
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30, // Equals 30 days
    },

  }));
  app.use(checkCheckoutToken);
};

