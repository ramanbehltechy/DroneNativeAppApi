const express = require("express");
const mobileShowController = require("../../controllers/mobile");
const router = express.Router();


router.get("/show/:id", mobileShowController.getShow);
router.get("/musicFile/:file", mobileShowController.getMusicFile);
router.post("/near-show", mobileShowController.checkNearShow);
router.get("/search", mobileShowController.searchShow);

module.exports = router;