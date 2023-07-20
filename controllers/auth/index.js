const User = require("../../database/models/user");
const bcrypt = require("bcrypt");
const Token = require("../../helper/token");
exports.signup = async (req, res) => {
  let { name = false, email = false, password = false } = req.body;
  // Check All Field is filled or not
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All field is required" });
  }
  // Check User is already Exist or not
  let checkUser = await User.findOne({ email });
  if (checkUser) {
    return res.status(400).json({ success: false, message: "User already Exist" });
  }

  try {
    let newUser = await User.create({ name, email, password });
    return res.status(201).json({ success: true, message: `Welcome ${newUser.name}` });
  } catch (err) {
    return res.status(400).json({ success: false, message: "All Feild is required" });
  }
};

exports.login = (req, res) => {

  const { email = false, password = false } = req.body;
  // Check All Field is filled or not
  if (!email || !password) {
    return res.status(400).json({ success: true, message: "All input is required" });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ success: false, message: "User not Found" });
      }
      // Check password is same or not
      bcrypt.compare(password, user.password,
        function (err, bcryptRes) {
          if (bcryptRes) {
            const token = Token.create({ id: user.id });
            let { name, email, avatar } = user;
            return res.status(200).send({ success: true, message: `Welcome ${user.name}`, userData: { name, email, avatar }, token });
          }
          return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }
      );
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).json({ success: false, message: "There is some error please try again later" });
    });
};