const adminRouter = require('../routes/admin');
const userRouter = require('../routes/user');
const shopRouter = require('../routes/shop');
const indexRouter = require('../routes/index');

module.exports = (app) =>{
  app.use('/', indexRouter);
  app.use('/admin', adminRouter);
  app.use('/user', userRouter);
  app.use('/shop', shopRouter);

  // error handler
  app.use((err, req, res, next)=>{
    res.status(err.status || 500).json({
      error: {
        status: err.status || 500,
        message: err.message || 'internal server error',
      },
    });
  });
};
