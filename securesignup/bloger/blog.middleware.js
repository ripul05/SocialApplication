var jwt = require('jsonwebtoken');

exports.verifyToken = function(req, res, next){
    console.log("reached here")
    const token = req.body.token;
    // console.log(req)
    // const token =req.session && req.session.token
    
    console.log(token)
    if(!token){
        // 401 unauthorized
        res.status(401).send("Token Invalid or Empty")
    }
    try {
        const decoded = jwt.verify(token, 'ripul');
        req.body.userid = decoded.email;
        next();
    } catch (error) {
        console.log(error)
        res.status(400).send("Invalid Token")
    }
} 
