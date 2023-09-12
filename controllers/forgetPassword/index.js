const nodemailer = require('nodemailer');
const hbs=require('nodemailer-express-handlebars')
const ForgetPasswordLink = require('../../database/models/forgetPassword'); 
const User=require('../../database/models/user')
const path = require('path');

exports.sendResetLink = async (req, res) => {
  const email = req?.body?.email;
  try {
    let user = await User.findOne({ email :email});
    if (!user) {
        return res.status(400).json({ success:false, message: 'Email does not exist' });
     
    }
    const d = new Date();
    const resetCode = d.getTime();

    const expiration = new Date(Date.now() + 15 * 60 * 1000);

    const resetPasswordLink = new ForgetPasswordLink({
      user_id: user?._id, 
      reset_code: resetCode,
      expires_in: expiration,
    });
    await resetPasswordLink.save();

    const templateData={
      name:`${user?.name}`,
      resetLink:`${process.env.ADMIN_BASE_URL}/#/update-password?code=${resetCode}`
    }

    const transporter = nodemailer.createTransport({
       
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"
        },
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
      });

      const handlebarOptions = {
        viewEngine: {
          extName: ".handlebars",
          partialsDir: path.resolve(__dirname, './views/'),
          defaultLayout: false,
        },
        viewPath: path.resolve( './views/'),
        extName: ".handlebars",
      };
      transporter.use(
        "compile",
        hbs(handlebarOptions)
      );

      const mailOptions = {
        from:process.env.SMTP_EMAIL,
        to: email,
        subject: 'Reset Your Password',
       template:'index',//Name of the template
       context:templateData ,
       attachments: [{
        filename: 'logo.png',
          path: './images/logo.png',
         cid: 'logo'
  }],         
      };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
      return  res.status(500).json({ success:false,message: 'Error sending email' });
      } else {
      }
    });
    return res.status(201).json({ success: true, message: 'Please check your mail for getting the forgot password link.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "There is some error please try again later" });
  }
};

exports.resetPassword = async (req, res) => {
   const {resetCode,data}=req.body;
   try{
    const resetLink=await ForgetPasswordLink.findOne({reset_code:resetCode});
    if(!resetLink){
       return res.status(400).json({ message: 'Invalid Reset Code' });
        
    }
    const currentTime=new Date();
    const timeDifference= resetLink.expires_in - currentTime;//millliseconds
    const timeDifferenceInMinutes=timeDifference/(1000*60);
    if(timeDifferenceInMinutes<=0){
      return  res.status(400).json({ success:false,message: 'Reset password link has been expired' });
    }
    const user=await User.findById(resetLink?.user_id);
    if(!user){
        return  res.status(404).json({ success: false, message: "User not found" });

    }
    user.password=data.newPassword;
    await user.save();
   // await resetLink.remove();
    return res.status(201).json({ success: true, message: 'Password has been reset successfully' });
   }catch(error){
    return res.status(500).json({ success: false, message: "There is some error please try again later" });
   }
  };
