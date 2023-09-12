const express = require("express");
const authController = require("../../controllers/auth")
const router = express.Router();
const tokenMiddleware = require("../../middleware/checkToken");

router.post("/auth/login", authController.login);
router.put("/editProfile",tokenMiddleware,authController.editProfile)
router.put("/update-password",tokenMiddleware,authController.updatePassword)

module.exports = router;