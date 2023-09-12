const Show = require("../../database/models/show");
const moment = require('moment');
const momentTz = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { FILE_API } = require('../../constants');

exports.getShow = async (req, res) => {
  try {
    const page=req.query.page ? parseInt(req.query.page) : 1;//
    const limit=req.query.limit ? parseInt(req.query.limit) : 10;//
      let totalCount =0;
    if (req.params.id) {
      data = await Show.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id), // Convert the ID to ObjectId and match the _id field
          }
        },
        
        {
          $lookup: {
            from: 'users', // Use "user" to match the schema definition
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        {
          $addFields: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            createdBy: { $arrayElemAt: ["$createdBy", 0] },
          }
        },
      ]);
      data = data[0]
    }
    else {
      data = await Show.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip    : (page-1)*limit },
        {$limit:limit},
        
        {
          $lookup: {
            from: 'users', // Use "user" to match the schema definition
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        {
          $addFields: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            createdBy: { $arrayElemAt: ["$createdBy", 0] },
          },
        },
        ...(req.user.role === "admin"
        ? [
            
          ]
        : [
          {
            $match: {
              "createdBy._id": new mongoose.Types.ObjectId(req.user.id),
            },
          },
        ]
      ),
      ]);
      if (req.user.role === "admin") {
        totalCount = await Show.countDocuments();
      } else {
        countResult  = await Show.aggregate([
          {
            $lookup: {
              from: 'users', // Use "user" to match the schema definition
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy',
            },
          },
          {
            $match: {
              "createdBy._id": new mongoose.Types.ObjectId(req.user.id),
            },
          },
          {
            $count: "totalCount",
          },
        ]);
        if (countResult.length > 0) {
          totalCount = countResult[0].totalCount;
        }
      }
    }
    if(!totalCount){totalCount = 0}
    if (!data) { return res.status(404).json({ success: false, message: `Data not founded` }); }
     return res.status(200).json({ success: true, message: `Data is founded`, data ,totalCount});
   
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: "There is some error please try again later" });
  }
};

exports.postShow = async (req, res) => {
  const { address, latitude, longitude, showTitle, description, date, startTime, radius, timezone } = req.body;

  let localDateTime = moment.utc(`${date} ${startTime}`, 'YYYY-MM-DD h:mm:ss A').toISOString();
  let utcDateTime = momentTz.tz(`${date} ${startTime}`, 'YYYY-MM-DD h:mm:ss A', timezone).toISOString();

  let location = {
    type: "Point",
    coordinates: [parseFloat(longitude), parseFloat(latitude)]
  }

  let pre_show, premp3, main_show, mainmp3, post_show, postmp3, preShowFile, mainShowFile, postShowFile;

  if (req?.files) {
    preShowFile = req?.files?.preShowFile ? req?.files?.preShowFile[0] : null;
    mainShowFile = req?.files?.file ? req?.files?.file[0] : null;
    postShowFile = req?.files?.postShowFile ? req?.files?.postShowFile[0] : null;
    if (preShowFile) {
      pre_show = true;
      premp3 = {
        fileName: preShowFile?.filename,
        filePath: path.join(FILE_API, preShowFile?.filename)
      }


    }
    if (mainShowFile) {
      main_show = true;
      mainmp3 = {
        fileName: mainShowFile.filename || null,
        filePath: path.join(FILE_API, mainShowFile?.filename)
      }

    }
    if (postShowFile) {
      post_show = true;
      postmp3 = {
        fileName: postShowFile.filename || null,
        filePath: path.join(FILE_API, postShowFile?.filename)
      }

    }
  }

  try {
    const createdBy = req.user.id;
    let newShow = new Show({ address, location, showTitle, description, date, startTime, radius, utcDateTime, pre_show, premp3, main_show, mainmp3, localDateTime, post_show, postmp3, timezone,createdBy });
    await newShow.save();
    return res.status(201).json({ success: true, message: `Show is Added Successfully` });
  } catch (err) {
    console.log(err)
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Fill all required field" });
    }
    return res.status(500).json({ success: false, message: "There is some error please try again later" });
  }
};

exports.editShow = async (req, res) => {

  const showId = req.params.id;
  const { address, latitude, longitude, showTitle, description, date, startTime, radius, timezone } = req.body;

  let localDateTime = moment.utc(`${date} ${startTime}`, 'YYYY-MM-DD h:mm:ss A').toISOString();
  let utcDateTime = momentTz.tz(`${date} ${startTime}`, 'YYYY-MM-DD h:mm:ss A', timezone).toISOString();

  let location = {
    type: "Point",
    coordinates: [parseFloat(longitude), parseFloat(latitude)]
  }

  let pre_show, premp3, main_show, mainmp3, post_show, postmp3, preShowFile, mainShowFile, postShowFile;

  if (req.body.premp3 && req.body.deletepremp3) {
    const filePath = path.join(__dirname, '../..', 'uploads', req.body.premp3);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      pre_show = false;
      premp3 = null
    }
  }

  if (req.body.postmp3 && req.body.deletepostmp3) {
    const filePath = path.join(__dirname, '../..', 'uploads', req.body.postmp3);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      post_show = false;
      postmp3 = null;
    }
  }

  if (req?.files) {
    preShowFile = req?.files?.preShowFile ? req?.files?.preShowFile[0] : null;
    mainShowFile = req?.files?.file ? req?.files?.file[0] : null;
    postShowFile = req?.files?.postShowFile ? req?.files?.postShowFile[0] : null;
    if (preShowFile) {
      pre_show = true;
      premp3 = {
        fileName: preShowFile?.filename,
        filePath: path.join(FILE_API, preShowFile?.filename)
      }

      if (req.body?.premp3) {
        const filePath = path.join(__dirname, '../..', 'uploads', req.body.premp3);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }


    }
    if (mainShowFile) {
      main_show = true;
      mainmp3 = {
        fileName: mainShowFile.filename || null,
        filePath: path.join(FILE_API, mainShowFile?.filename)
      }
      if (req.body?.mainmp3) {
        const filePath = path.join(__dirname, '../..', 'uploads', req.body.mainmp3);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }


    }
    if (postShowFile) {
      post_show = true;
      postmp3 = {
        fileName: postShowFile.filename || null,
        filePath: path.join(FILE_API, postShowFile?.filename)
      }
      if (req.body?.postmp3) {
        const filePath = path.join(__dirname, '../..', 'uploads', req.body.postmp3);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

    }
  }

  try {
    let updatedShowData = {
      address,
      location,
      showTitle,
      description,
      date,
      startTime,
      radius,
      utcDateTime,
      pre_show,
      premp3,
      main_show,
      mainmp3,
      localDateTime,
      post_show,
      postmp3,
      timezone
    };

    const updatedShow = await Show.findByIdAndUpdate(showId, updatedShowData, { new: true });

    if (!updatedShow) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    return res.status(200).json({ success: true, message: `Show is Updated Successfully`, show: updatedShow });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Fill all required fields" });
    }
    return res.status(500).json({ success: false, message: "There is some error, please try again later" });
  }
};

exports.deleteshow = async (req, res) => {
  let { id } = req.params;
  try {
    let checkshow = await Show.findById(id);
    if (!checkshow) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }
     await Show.findByIdAndRemove(id)
    let filesObject = {}
    if (checkshow?.premp3?.fileName) {
      filesObject["premp3"] = checkshow?.premp3
    }
    if (checkshow?.mainmp3?.fileName) {
      filesObject["mainmp3"] = checkshow?.mainmp3
    }
    if (checkshow?.postmp3?.fileName) {
      filesObject["postmp3"] = checkshow?.postmp3
    }
    await deleteFile(`uploads`, filesObject)

    return res.status(200).json({ success: true, message: `Show is Deleted Successfully` });

  }
  catch (err) {
    console.log(err, 'err')
    return res.status(500).json({ success: false, message: "There is some error, please try again later" });
  }
}

const deleteFile = (directoryPath, filesObject) => {
  return new Promise((resolve, reject) => {
    Object.keys(filesObject).forEach((key) => {
      const fileDetails = filesObject[key];
      fs.access(`${directoryPath}/${fileDetails?.fileName}/`, error => {
        if (!error) {
          fs.unlink(`${directoryPath}/${fileDetails.fileName}`, (err) => {
            if (err) {
              reject(`Error deleting the file: ${err}`);
            } else {
              resolve(`File ${fileDetails?.fileName} has been deleted successfully.`);
            }
          });
        }
        else {
         console.log(error,'error')
        }
      })
    });
  });
};