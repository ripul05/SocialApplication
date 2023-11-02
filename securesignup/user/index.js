var Express = require("express")
var userController = require("./user.contoller")
const { route } = require("../bloger")

var routes = Express.Router()

routes.post("/register",userController.signup)

routes.post("/verify",userController.verify)

routes.post("/login",userController.logincheck)

routes.post("/resendotp",userController.resendOtp)

routes.post("/forgotpass",userController.resendOtp)

routes.post("/resetpass",userController.resetPass)

routes.post("/loadchat",userController.loadchat)

routes.post("/savechat",userController.savechat)

routes.post("/resendotpver",userController.resendOtpver)

routes.post("/commentter",userController.commentter)

routes.post("/showcomment",userController.showcomment)

routes.post("/likedata",userController.likedata)

routes.post("/showliked",userController.showliked)

routes.post("/myprofile",userController.myprofile)

routes.post("/search",userController.usersearch)

routes.post("/finduser",userController.finduser)

routes.post("/updateprofile",userController.profileupdate)

module.exports = routes