const express = require("express")
const router = new express.Router();
const auth = require("./auth")
const show = require("./show");
const user = require('./user');
const mobile = require('./mobile');
const forgetPassword=require('./forgetPassword')
const checkToken = require("../middleware/checkToken");

router.use(auth);
router.use('/mobile',mobile );
router.use('/api',show );
router.use('/user',checkToken, user);
router.use('/api',forgetPassword)
module.exports = router;