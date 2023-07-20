const express = require("express");
const showController = require("../../controllers/show");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');


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
router.get("/api/show", showController.getShow);
router.get("/api/show/:id", showController.getShow);
router.post("/api/show", upload.fields([{ name: 'preShowFile', maxCount: 1 }, { name: 'file', maxCount: 1 }, { name: 'postShowFile', maxCount: 1 }]), showController.postShow);
router.get("/api/musicFile/:file", showController.getMusicFile);
router.post("/api/near-show", showController.checkNearShow);
router.get("/api/search", showController.searchShow);

module.exports = router;