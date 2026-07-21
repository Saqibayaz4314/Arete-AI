const userModel = require("../models/user.model")
const tokenBlackListModel = require("../models/blacklist.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")

/**
@name registerUserController
@description Register a new user, expect email and pasword in the request body
@access Public

*/
async function registerUserController(req, res){
  try {
    const {username, email, password, confirmPassword} = req.body
    
    if(!username || !email || !password || !confirmPassword){
      return res.status(400).json({
        message: "Please provide username, email, password and confirmPassword"
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      })
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }]
    })

    if(isUserAlreadyExists){
      return res.status(400).json({
        message: "Account already exists with this email address or username"
      })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
      username,
      email,
      password: hash
    })

    const token = jwt.sign(
      {id:user._id, username:user.username},
      process.env.JWT_SECRET,
      {expiresIn: "1d"}
    )
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    res.status(201).json({
      message: "User Registered Successfully",
      token,
      user:{
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Account already exists with this email address or username"
      })
    }
    console.error("Register controller error:", error)
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
}

/** 
@name loginUserController
@description login a user, expect email and pasword in the request body
@access Public

*/

async function loginUserController(req, res){
  const { email, password } = req.body || {};
  const cleanEmail = email ? email.trim().toLowerCase() : "";

  const user = await userModel.findOne({
    $or: [{ email: cleanEmail }, { username: email ? email.trim() : "" }]
  })
  if(!user){
    return res.status(400).json({
      message: "Invalid email or password"
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if(!isPasswordValid){
    return res.status(400).json({
      message: "Invalid email or password"
    })
  }
  const token = jwt.sign(
    {id:user._id, username:user.username},
    process.env.JWT_SECRET,
    {expiresIn: "1d"}
  )
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  })
  res.status(200).json({
    message: "User loggedIn successfully.",
    token,
    user:{
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
}


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist 
 * @access public
 */

async function logoutUserController(req, res){
  const token = req.cookies.token
  if(token){
    await tokenBlackListModel.create({token})
  }
  res.clearCookie("token")
  res.status(200).json({
    message: "User logged out successfully"
  })
}

async function getMeController(req, res){
  try {
    const user = await userModel.findById(req.user.id)
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" })
    }
    res.status(200).json({
      message: "User details fetched successfully",
      user:{
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message })
  }
}

async function forgotPasswordController(req, res) {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "There is no account associated with that email" });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url (fallback to live HTTPS domain)
    const baseUrl = process.env.CLIENT_URL || "https://arete-ai.duckdns.org";
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because a password reset request was made for your Arete-AI account. Please use the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request — Arete-AI",
      message,
      resetUrl,
      username: user.username || "Candidate"
    });

    res.status(200).json({ success: true, message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    return res.status(500).json({ message: "Email could not be sent: " + error.message });
  }
}

async function resetPasswordController(req, res) {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Set new password
  const hash = await bcrypt.hash(req.body.password, 10);
  user.password = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully"
  });
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  forgotPasswordController,
  resetPasswordController
}