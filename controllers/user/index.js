const bcrypt = require('bcrypt')
const User = require('../../database/models/user')
const nodemailer=require("nodemailer");
const hbs=require('nodemailer-express-handlebars')
const Show = require('../../database/models/show');
const mongoose = require('mongoose');
const path = require('path');
exports.addUser = async (req, res) => {
    
    let { name = false, email = false, password = false, role } = req.body;
    // Check All Field is filled or not
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All field is required" });
    }
    // Check User is already Exist or not
    let checkEmail = await User.findOne({ email });
    if (checkEmail) {
        return res.status(400).json({ success: false, message:  "Email already Exist" });
    }
    // const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_HASH));
    let payload = {
        name,
        email,
        password
    }
  
    if (role) {   
        payload.role = role
    }
    
    try {
        let newUser = await User.create(payload);  
        const templateData={
            name:`${name}`,
            email:`${email}`,
            password:`${password}`  
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
          const mailOptions={
            from:process.env.SMTP_EMAIL,
            to:email,
            subject:'Your Account has been Created Successfully',
            template:'account',
            context:templateData,
            attachments: [{
                filename: 'logo.png',
                path: './images/logo.png',
                cid: 'logo'
          }],
          }

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error, "error123");
            }
        });

        return res.status(201).json({ success: true, message: 'User added successfully' });
    } catch (err) {
        return res.status(400).json({ success: false, message: "All Feild is required" });
    }
};

exports.getUser = async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const skip_page = (page - 1) * limit;
    let totalCount = 0;
    try {
        let data = await User.find({ role : "user"  , isDeleted : false})
        .skip(skip_page)
            .limit(limit)
            .sort({ createdAt: -1 });
             totalCount=await User.countDocuments({ role : 'user', isDeleted : false});
          
        if (!data) {
            return res
                .status(400)
                .json({ success: true, message: "User List is empty" });
        }
        if(!totalCount){totalCount = 0}
         return res
            .status(200)
             .json({ success: true, message: "User Fetched successfully", data ,totalCount});
    } catch (error) {
   
        return res.status(400).json({
            success: false,
            message: "There is some error please try again later",
        });
    }
};

exports.updateUser = async (req, res) => {
    let { name = false, email = false, password = false } = req.body;
    try {
        let hashedPassword;
        if(password){
            hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_HASH));
        }
      
        if (!req.params.id) {
            return res
                .status(400)
                .json({ success: false, message: "Id is required" });
        }
        const userToUpdate=await User.findById(req.params.id);
        if(!userToUpdate){
            return res
            .status(404)
            .json({ success: false, message: "User not found" });

        }
        if(email && email !== userToUpdate.email){
            const existingUser=await User.findOne({email});
            if(existingUser){
                return res
                .status(400)
                .json({ success: false, message: "Email already exist." });
            }
        }
        if(password){
         
            await User.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    name,
                    email,
                    password: hashedPassword
                },
                { new: true }
            );
            const templateData={
                name:`${name}`,
                password:`${password}`  
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
                  const mailOptions={
                    from:process.env.SMTP_EMAIL,
                    to:email,
                    subject:'Password Updated Successfully',
                    template:'updatePassword',
                    context:templateData ,
                    attachments: [{
                        filename: 'logo.png',
                        path: './images/logo.png',
                        cid: 'logo'
                    }],
        
                  }
        
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error, "error123");
                        
                    }
                    else {
                       
                    }
                });

        }else{
            await User.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    name,
                    email,
                },
                { new: true }
            );
            const templateData={
                name:`${name}`,
                email:`${email}`, 
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
                  const mailOptions={
                    from:process.env.SMTP_EMAIL,
                    to:email,
                    subject:'Your Email has been updated Successfully',
                    template:'emailUpdate',//Name of the template
                    context:templateData ,
                    attachments: [{
                     filename: 'logo.png',
                       path: './images/logo.png',
                      cid: 'logo'
               }],
        
                  }
        
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error, "error123");
                    }
                    else {

                    }
                });

        }
        
        return res
            .status(200)
            .json({ success: true, message: "User is Updated suceessfully" });
    } catch (error) {
        
          return res.status(500).json({ success: false, message: "There is some error please try again later" });
        
        // return res.status(400).json({
        //     success: false,
        //     message: "There is some error please try again later",
        // });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (!req.params.id) {
            return res
                .status(400)
                .json({ success: false, message: "Id is required" });
        }

        const unDeletedShows = await Show.countDocuments({ createdBy: new mongoose.Types.ObjectId(req.params.id) });
        
        if (unDeletedShows && unDeletedShows > 0) {
            return res.status(400).json({ success: true, message: "First you have to delete user's associated shows" });
          } else {
            await User.findByIdAndDelete(req.params.id , {new : true});
        return res
            .status(200)
            .json({ success: true, message: "User is deleted suceessfully" });
          }   
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "There is some error please try again later",
        });
    }
};
