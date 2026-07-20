const express = require('express')
const authController = require("../controllers/auth.controller")
const tokenBlackListModel = require('../models/blacklist.model')
const authMiddleware = require("../middlewares/auth.middleware")
const authRouter = express.Router()


/** 
* @route POST /api/auth/register
* @description Register a new user
* @access Public
*/

authRouter.post('/register', authController.registerUserController)

/** 
@routes POST /api/auth/login
@description login a user with email and password
@access Public
*/

authRouter.post("/login", authController.loginUserController)


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist 
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @route GET /api.auth/get-me
 * @description get the current logged in user details
 * @access private
 * */ 

authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController )

/**
 * @route POST /api/auth/forgot-password
 * @description send reset password token to user email
 * @access public
 */
authRouter.post("/forgot-password", authController.forgotPasswordController)

/**
 * @route PUT /api/auth/reset-password/:token
 * @description reset the user password with the valid token
 * @access public
 */
authRouter.put("/reset-password/:token", authController.resetPasswordController)

module.exports = authRouter