const express = require("express");
const userController = require("../../controllers/user");
const isAdmin = require("../../middleware/isAdmin");
const router = express.Router();

router.post("/add",isAdmin, userController.addUser);
router.get("/list",isAdmin, userController.getUser);
router.put("/update/:id", isAdmin,userController.updateUser)
router.delete("/delete-user/:id",isAdmin, userController.deleteUser)

module.exports = router;