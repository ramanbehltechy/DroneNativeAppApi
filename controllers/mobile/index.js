const Show = require("../../database/models/show");
const momentTz = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

exports.getShow = async (req, res) => {
 if(!req.params.id){return res.status(400).json({ success: false, message: `Id is missing` }); }
  try {
    if (req.params.id) {
      data = await Show.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id), // Convert the ID to ObjectId and match the _id field
          }
        },
        {
          $addFields: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          }
        },
      ]);
      data = data[0]
    }
    if (!data) { return res.status(404).json({ success: false, message: `Data not founded` }); }
    return res.status(200).json({ success: true, message: `Data is founded`, data });
   
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: "There is some error please try again later" });
  }
};

exports.searchShow = async (req, res) => {
  const { showTitle, date, time, timezone } = req.query;
  // Current time
  if (!showTitle, !date, !time, !timezone) {
    return res.status(400).json({ success: false, message: "All fields is required" });
  }

  try {
    let utcDateTime = momentTz.tz(`${date} ${time}`, 'YYYY-MM-DD h:mm:ss A', timezone).toISOString();
    const fourHoursAgo = new Date(utcDateTime);
    const twoHoursAhead = new Date(utcDateTime);
    // Subtract 4 hours from the start date
    fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

    // Add 2 hours to the end date
    twoHoursAhead.setHours(twoHoursAhead.getHours() + 2);

    const shows = await Show.find({
      showTitle: {
        $regex: showTitle,
        $options: 'i' // 'i' flag makes the search case-insensitive
      },
      // utcDateTime: { $gte: fourHoursAgo, $lte: twoHoursAhead },
      // timezone: timezone,
    });

    return res.status(200).json({ success: true, message: `Data is founded`, shows });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

exports.getMusicFile = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../..', 'uploads', req.params.file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.sendFile(filePath);
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: "There is some error please try again later" });
  }
};

exports.checkNearShow = async (req, res) => {
  const { latitude, longitude, radius = 10, date, time, timezone } = req.body;

  if (!latitude, !longitude, !radius, !date, !time, !timezone) {
    return res.status(400).json({ success: false, message: "All fields is required" });
  }

  // Radius of the circle in miles``
  const centerCoordinates = [parseFloat(longitude), parseFloat(latitude)];

  try {
    let shows = [];
    let utcDateTime = momentTz.tz(`${date} ${time}`, 'YYYY-MM-DD h:mm:ss A', timezone).toISOString();
    const fourHoursAgo = new Date(utcDateTime);
    const twoHoursAhead = new Date(utcDateTime);
    // Subtract 4 hours from the start date
    fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

    // Add 2 hours to the end date
    twoHoursAhead.setHours(twoHoursAhead.getHours() + 2);

    shows = await Show.aggregate([
      // {
      //   $match: {
      //     location: {
      //       $geoWithin: {
      //         $centerSphere: [centerCoordinates, radius / 3963.2]
      //       }
      //     },
      //     timezone: timezone,
      //     utcDateTime: { "$gte": fourHoursAgo, "$lte": twoHoursAhead }
      //   },
      // },
      {
        $addFields: {
          isLive: true,
        }
      }
    ]);


    return res.status(200).json({ success: true, message: `Data is founded`, shows });
  } catch (err) {
    console.log(err)
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "All fields is required" });
    }
    return res.status(500).json({ success: false, message: "There is some error please try again later" });
  }
};
