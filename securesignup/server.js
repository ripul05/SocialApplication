var Express = require("express")
const routes = require("./routes.js")
const BodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const cors = require('cors')



var Port = 5000
const server = Express()

server.use(cors({
    exposedHeaders:["Authorization"]
}))

server.use(BodyParser.json())
server.use(routes)

server.use(session({
    secret: "ripul",
    
}));

server.get("/",(req,res)=>{
    res.send("Server is on and running")
    
})




// Cannot GET /user/register/verify


server.listen(Port,(req,res)=>{
    console.log("Server is running on the Port",Port)
})

