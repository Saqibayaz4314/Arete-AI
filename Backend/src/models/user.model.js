const mongoose = require("mongoose")


const crypto = require("crypto")

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    unique:[true, "username already taken"],
    required: true,
  },
  email:{
    type: String,
    unique: [true, "Account already exists with this email address"],
    required: true
  },

  password:{
    type: String,
    required:true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
})

userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  return resetToken;
}

const userModel = mongoose.model("users", userSchema)

module.exports = userModel