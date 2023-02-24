const nodemailer = require('nodemailer');
const fEmail = process.env.EMAIL;
const appName = process.env.APP_NAME;
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: fEmail,
    pass: process.env.EMAIL_PASS,
  },
});
const email = {
  sendOtp: (email) => {
    return new Promise( (resolve, reject)=>{
      const otp = Math.floor(Math.random() * 9000) + 1000;
      const mailOption = {
        from: `${appName} ${process.env.EMAIL}`,
        to: email,
        subject: 'Otp verification',
        html: `<h2>Your verification code for ${appName} is : ${otp} </h2>`,
      };
      transporter.sendMail(mailOption, (err, info)=>{
        if (err) {
          reject(err);
        } else {
          resolve(otp);
        }
      });
    });
  },
  resendOtp: (email) => {
    return new Promise((resolve, reject)=>{
      const otp = Math.floor(Math.random() * 9000) + 1000;
      const mailOption = {
        from: `${appName} ${process.env.EMAIL}`,
        to: email,
        subject: 'Otp - Resend - verification',
        html: `<h2>Your verification code for ${appName} is : ${otp} </h2>`,
      };
      transporter.sendMail(mailOption, (err, info)=>{
        if (err) {
          reject(err);
        } else {
          resolve(otp);
        }
      });
    });
  },
};
module.exports = email;
