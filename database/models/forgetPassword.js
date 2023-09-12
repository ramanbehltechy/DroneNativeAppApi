const mongoose = require('mongoose');

const forgetPasswordLinkSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  reset_code: {
    type: String,
    required: true,
  },
  expires_in: {
    type: Date,
    required: true,
  },
});

const ForgetPasswordLink = mongoose.model('ForgetPassword', forgetPasswordLinkSchema);

module.exports = ForgetPasswordLink;
