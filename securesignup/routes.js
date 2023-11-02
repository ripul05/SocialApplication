const Express = require("express")
const { verifyToken } = require("./bloger/blog.middleware")

var routes = Express.Router()

 
routes.use("/user",require('./user'))

// routes.use("/blog",verifyToken,require('./bloger')) 

routes.use("/blog",require('./bloger'))

module.exports = routes
