const nodemailer = require('nodemailer');
const fEmail = process.env.EMAIL;
const appName = process.env.APP_NAME;
const appUrl = process.env.APP_URL;
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
          // eslint-disable-next-line max-len
          reject(new Error('There is a trouble sending mail now, try again later'));
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
          // eslint-disable-next-line max-len
          reject(new Error('There is a trouble sending mail now, try again later'));
        } else {
          resolve(otp);
        }
      });
    });
  },
  sendUrl: (email, token) => {
    return new Promise((resolve, reject)=>{
      const mailOption = {
        from: `${appName} ${process.env.EMAIL}`,
        to: email,
        subject: 'Reset your password',
        html: `<h4> Click the link to reset your password </h4> <br/>
        <a href="${appUrl}/reset-password/${token}" >Reset Password</a>`,
      };
      transporter.sendMail(mailOption, (err, info)=>{
        if (err) {
          // eslint-disable-next-line max-len
          reject(new Error('There is a trouble sending mail now, try again later'));
        } else {
          resolve();
        }
      });
    });
  },
};
module.exports = email;
