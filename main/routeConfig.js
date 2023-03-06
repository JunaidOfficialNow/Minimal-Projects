const adminRouter = require('../routes/admin');
const userRouter = require('../routes/user');
const shopRouter = require('../routes/shop');

module.exports = (app) =>{
  app.use('/', userRouter);
  app.use('/admin', adminRouter);
  app.use('/shop', shopRouter);

  // error handler
  app.use((err, req, res, next)=>{
    if (req.get('Origin')) {
      res.status(err.status || 500).json({
        error: {
          status: err.status || 500,
          message: err.message || 'internal server error',
        },
      });
    } else {
      res.render('500', {message: err.message});
    };
  });
  app.all('*', (req, res)=> {
    res.render('404.ejs');
  });
};
