const User = require("../../database/models/user");
const bcrypt = require("bcrypt");
const Token = require("../../helper/token");


exports.login = (req, res) => {

  const { email = false, password = false } = req.body;
  // Check All Field is filled or not
  if (!email || !password) {
    return res.status(400).json({ success: true, message: "All input is required" });
  }
  User.findOne({ email ,isDeleted : false})
    .then((user) => {
      if (!user) {
        return res.status(400).json({ success: false, message: "User not Found" });
      }
      // Check password is same or not
      bcrypt.compare(password, user.password,
        function (err, bcryptRes) {
          if (bcryptRes) {
            const token = Token.create({ id: user.id,role: user.role });
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


//edit Profile Api
exports.editProfile=async(req,res)=>{
  const {name,email}=req.body;
  try{
    let updateFields = {
      name ,
      email
    }
    const existingUser = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true });
    if(!existingUser){
      return  res.status(404).json({ success: false, message: "User not found" });
    }
   return res.status(200).send({ success: true, message:"Profile updated successfully" , user:existingUser });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Invalid Data Provided" });
    }
    return res.status(500).json({ success: false, message: "There is some error, please try again later" });
  }
}


//Update Password Api
exports.updatePassword=async(req,res)=>{
  const {newPassword,confirmPassword}=req.body;
  try{
    if(!newPassword || !confirmPassword){
      return res.status(400).json({ success: false, message: "All fields are required." }); 
    }
   if(newPassword !== confirmPassword)
   {
    return res.status(400).json({ success: false, message: "Password do not match" }); 
   }
  const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_HASH));
  const updatedUser = await User.findByIdAndUpdate(req.user.id, { password: hashedPassword }, { new: true });

    if(!updatedUser){
      return  res.status(404).json({ success: false, message: "User not found" });
    }
   return res.status(200).send({ success: true, message:"Password updated successfully"});
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Invalid Data Provided" });
    }
    return res.status(500).json({ success: false, message: "There is some error, please try again later" });
  }
}
