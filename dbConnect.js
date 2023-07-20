const mongoose = require('mongoose');
module.exports = function ConnectDb() {
    mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log("Successfully connect to MongoDB.");
        return true;
    })
    .catch(err => {
        console.error("Connection error", err);
        return false;
    });
}