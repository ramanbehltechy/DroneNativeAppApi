const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is requied"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is requied"],
      unique: true,
    },
    password: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  let userData = this;
  bcrypt
    .hash(this.password, Number(process.env.BCRYPT_HASH))
    .then(function (hash) {
      userData.password = hash;
      next();
    })
    .catch((err) => {
      console.log("err", err);
      next("err");
    });
});

let User = mongoose.model("user", userSchema);
module.exports = User;
