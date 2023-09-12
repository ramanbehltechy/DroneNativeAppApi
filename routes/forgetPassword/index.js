const express = require("express");
const forgetPasswordController=require('../../controllers/forgetPassword')
const router = express.Router();

router.post("/forget-password", forgetPasswordController.sendResetLink);
 router.put("/reset-password", forgetPasswordController.resetPassword);



module.exports = router;