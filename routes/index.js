const express = require("express")
const router = new express.Router();
const auth = require("./auth")
const show = require("./show")

router.use(auth);
router.use(show);

module.exports = router;