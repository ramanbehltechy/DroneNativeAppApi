const express = require("express");
const showController = require("../../controllers/show");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const checkToken = require("../../middleware/checkToken");
const isAdmin = require("../../middleware/isAdmin");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const targetDirectory = `uploads`;
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory); // Create the target directory if it doesn't exist
        }
        cb(null, targetDirectory);
    },
    filename: (req, file, cb) => {
        let fileName;
        if (file.fieldname === 'preShowFile') {
            fileName = Date.now() + '-preShowFile-' + file.originalname;
        } else if (file.fieldname === 'file') {
            fileName = Date.now() + '-mainFile-' + file.originalname;
        }
        else if (file.fieldname === 'postShowFile') {
            fileName = Date.now() + '-postShowFile-' + file.originalname;
        }
        cb(null, fileName);
    }
});



const upload = multer({ storage });
router.get("/show",checkToken, showController.getShow);
router.get("/show/:id",checkToken, showController.getShow);
router.post("/show",checkToken,upload.fields([{ name: 'preShowFile', maxCount: 1 }, { name: 'file', maxCount: 1 }, { name: 'postShowFile', maxCount: 1 }]), showController.postShow);
router.put("/edit-show/:id",checkToken,isAdmin, upload.fields([{ name: 'preShowFile', maxCount: 1 }, { name: 'file', maxCount: 1 }, { name: 'postShowFile', maxCount: 1 }]), showController.editShow);
router.delete('/delete-show/:id',checkToken,isAdmin, showController.deleteshow)

module.exports = router;