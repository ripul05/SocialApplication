var Express = require("express")
var userService = require("./user.service")
var db = require('../dbConnection')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
const pool = require("../dbConnection")
const { use } = require("../bloger")

//event loop,event queue, browser api

exports.signup = function(req,res){
    // db.connect()
    const data = req.body
    console.log(data)
    try{
        if (data.email!=NaN){
            userService.addUserOtp(data.email)
        .then((result)=>{
            console.log(result)
            
            if(result==="AV"){
                res.send("User is already verified")
            }
            else if(result==="otpsent"){
                res.send("A new otp is sent to your email")

            }
            else if (result==="AO"){
                res.send("Otp has already been sent please request for new otp after 5 minutes")
            }
            else if (result==="newEntry"){
                res.send("New user an otp has been sent to your email")
            }
            }).catch((error)=>{
                console.log("an error occured",error)
                res.status(500).json({
                message: "An error occured",
                error : error
                })
            })
        }
    }
    catch{
        console.log("Error occured")
        res.send("Error occured")
    }
    
    // db.end()
    
    


}

exports.verify = async function (req, res) {
    const data = req.body;
    email = data.email
    otp = data.otp
    pass = data.pass
    // console.log(req)
    try {
        // await db.connect();

        const vuser = await db.query('SELECT * FROM otptable WHERE email = $1', [email]);
        const user = vuser.rows[0];

        if (user) {
            if (!user.verified) {
                const currtime = new Date()
                if((currtime-user.ctime)<300000){
                    if (otp == user.otp) {
                        await db.query('UPDATE otptable SET verified = true WHERE email = $1', [email]);
                        console.log('User registration is complete');
    
                        // Assuming userService.addUserDetails is an asynchronous function
                        // password = await bcrypt.hash(pass,10)
                        await db.query("INSERT INTO USERDETAILS (email, password) VALUES($1, $2)",[user.email,pass])
    
                        console.log("USER is registered into the database USERDETAILS")
    
                        res.send('NRC');//new registration complete
                    } else {
                        res.send('IO');//invalid otp
                    }

                }
                else{
                    res.send("TEX")//time period expired for otp verification
                }
                
            } else {
                res.send('UAR');//user already registered
            }
        } else {
            res.send('UNF');// user not found
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    } 
    // finally {
    //     await db.end();
    // }
};


// correct this code and resolve error

exports.resendOtp = async function(req,res){
    const data = req.body
    const email = data.email
    try{
        const vuser =await db.query(`Select * from otptable where email = '${email}'`)
        if(!vuser.rowCount){
            res.send("NU")//new user
        }
        else if(!vuser.rows[0].verified){
            res.send("UNV")//user not verified
        }
        else{
            const otp = userService.generateOtp()
            const time = new Date();
            const tabTime = vuser.rows[0].ctime
            const tlapse = time-tabTime
            if(tlapse>300000){
                console.log("New Otp for your verification is",otp)
                await db.query("UPDATE otptable SET otp = $1, ctime = $2 WHERE email = $3", [otp, time, email]);
                res.send("otpsent")

            }
            else{
                console.log("Otp already sent")
                res.send("OAS")//otp already sent and time lapse is less than 5 minutes
            }
        }
    }
    catch(error){

    }
    
}

exports.resendOtpver= async function(req,res){
    const data = req.body
    const email = data.email
    console.log("Reached resendotpver",email)
    try{
        const vuser =await db.query(`Select * from otptable where email = '${email}'`)
        if(!vuser.rowCount){
            res.send("NU")//new user
        }
        
        else{
            const otp = userService.generateOtp()
            const time = new Date();
            const tabTime = vuser.rows[0].ctime
            const tlapse = time-tabTime
           
            console.log("New Otp for your verification is",otp)
            await db.query("UPDATE otptable SET otp = $1, ctime = $2 WHERE email = $3", [otp, time, email]);
            console.log("Otpsent")
            res.send("otpsent")

           
        }
    }
    catch(error){

    }
}

exports.logincheck = async function (req,res){
    const data = req.body
    const email = data.email
    const pass = data.pass

    
    // console.log(data)
    console.log(data)

    const veruser = await db.query(`select * from userdetails where email = '${email}'`)
    const user = veruser.rows[0]
    if (user){
        // const passmatch = await bcrypt.compare(pass,user.password)
        // console.log(passmatch)
        if (pass==user.password){
            const secretKey = 'ripul'
            const vtoken = jwt.sign({email:data.email},secretKey,{expiresIn:'2h'})

            console.log("user is verified and logged in")

            // res.session.token = vtoken
            res.header('Authorization',  vtoken);
            res.send("User is logged in",vtoken,email)

            
             console.log(vtoken)
            
            
        }
        else{
            console.log("Incorrect Password entered")
            res.status(401).send("Incorrect Password")
        }
    }
    else{
        console.log("User is not registered")
        res.status(401).send("User is not registered")
    }
}



exports.resetPass = async function(req,res){
    // const data = req.body
    console.log(req.body)
    const email = req.body.email
    const otp = req.body.otp
    const pass = req.body.pass


    const isUser = await db.query(`Select * from userdetails where email =$1`,[email])
    console.log(isUser.rows[0])

    if(isUser.rowCount>0){
        
        console.log("user exists in the database")

        await userService.addUserOtp(email)
        const a = await userService.verifyUser(email,otp)
        
        if (a=="true"){
            // const password = await bcrypt.hash(pass,10)
            await db.query('Update userdetails set password = $1 where email=$2',[pass,email])
            res.send("PU")//password updated
        }
        else{
            res.send("VF")//verification failed
        }
    }
    else{
        
        res.send("UNR")//user not registered
    }
  }

exports.loadchat=async function(req,res){
const sender = req.body.sender
const receiver = req.body.receiver
const chats =await db.query("SELECT * FROM chathistory WHERE (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1) ORDER BY message_time;",[sender,receiver])

if (chats.rowCount==0 ){
    // const newchat = await db.query("Insert into chathistory (sender, receiver ) VALUES ($1, $2)",[sender, receiver])
    console.log("This is a new chat ")
    res.send("New chat")

}
else{
    console.log("chat loaded")
    res.send(chats.rows)
}
}

exports.savechat = async function(req,res){
    const sender = req.body.sender
    const receiver = req.body.receiver
    const message = req.body.message
    try{
        const save = db.query("Insert into chathistory (sender,receiver,message) VALUES($1,$2,$3)",[sender,receiver,message])
        res.send("chat saved")
    }
    catch(error){
        res.send("Error occured",error)
    }
    
}

exports.commentter = async function(req,res){
    const post_id = req.body.post_id
    const sentby = req.body.sentby
    const sentto = req.body.sentto
    const message = req.body.message

    await db.query("Insert into comments(post_id, userid, comment_text) VALUES($1, $2,$3) ",[post_id,sentby,message])
    
    res.send("Commenter call reached")
}

exports.showcomment = async function(req,res){
    const post_id = req.body.post_id
    const user = await db.query("Select userid, comment_text,date_created from comments where post_id = $1 order by comment_id",[post_id])
    res.send(user.rows)
}

exports.likedata = async function(req,res){
    const user_id = req.body.user_id
    const post_id = req.body.post_id
    const luser = await db.query("Select * from likedata where post_id= $1 and user_id = $2",[post_id,user_id])
    if(luser.rowCount==0){
        await db.query("Insert into likedata (post_id,user_id) VALUES($1,$2)",[post_id,user_id])
        await db.query("Update blog_posts set likes = likes+1 where post_id = $1",[post_id])
        const vuser = await db.query("Select likes from blog_posts where post_id = $1",[post_id])
        console.log(vuser)
        res.send({boollike:"Liked",numlike: vuser.rows[0].likes})
    }
    else{
        await db.query("Delete  from likedata where post_id = $1 and user_id = $2",[post_id,user_id])
        await db.query("Update blog_posts set likes = likes-1 where post_id = $1",[post_id])
        const vuser = await db.query("Select likes from blog_posts where post_id = $1",[post_id])
        console.log(vuser)
        res.send({boollike:"Disliked", numlike:vuser.rows[0].likes})
    }
    
}

exports.showliked = async function(req,res){
    
    const user_id = req.body.user_id
    const luser =await db.query("Select post_id from likedata where  user_id = $1",[user_id])
    const larray = luser.rows.map((row)=> row.post_id)
    console.log(larray)
    res.send(larray)
}

exports.likenumber = async function (req,res){
    const post_id = req.body.post_id
    const lnumber = await db.query("Select likes from blog_post where post_id = $1",[post_id])
    res.send(lnumber.rows[0].likes)
}

exports.myprofile = async function(req,res){
    const user_id = req.body.user_id
    const mydata= await db.query("select * from profile where userid=$1",[user_id])
    res.send(mydata.rows[0])
}

exports.usersearch=async function(req,res){
    const userid = req.body.user_id
    console.log(userid)
    const userdeets = await db.query("Select userid,name,age,experience from profile where userid = $1",[userid])
    if(userdeets.rowCount===0){
        res.send("NF")//user not found
    }
    else{
        res.send(userdeets.rows[0])
    }
}

exports.finduser = async function(req,res){
    const tofind = req.body.userid
    const users = await db.query("Select * from userdetails where email = $1 ",[tofind])
    if (!users.rowCount){
        res.send("NUF")//no user found
    }
    else{
        const puser = await db.query("Select * from profile where userid=$1",[tofind])
        if(!puser.rowCount){
            res.send("PDE")// profile doesnt exists
        }
        else{
            res.send(puser.rows[0])
        }
        
    }
}

exports.profileupdate= async function(req,res){
    console.log("Profileupdate call reached ")
    console.log(res.body)
    let userid = req.body.userid
    let name = req.body.name
    let gender = req.body.gender
    let age = req.body.age
   
    let bloodgroup = req.body.bloodgroup
    let experience = req.body.experience
    let maxqual = req.body.maxqualification
    let bio = req.body.bio
    let img_url = req.body.img_url
   
    try{
        const puser = await db.query("Select * from profile where userid=$1",[userid])
        if(!puser.rowCount){

            await db.query("INSERT INTO profile (userid, name, gender, age, bloodgroup, experience, maxqualification, bio ,img_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [userid, name, gender, age, bloodgroup, experience, maxqual, bio, img_url]);
            console.log("new user info updated")
        }
        else{
            name = name||puser.rows[0].name
            gender = gender||puser.rows[0].gender
            age = age || puser.rows[0].age
            bloodgroup = bloodgroup|| puser.rows[0].bloodgroup
            experience = experience|| puser.rows[0].experience
            img_url = img_url|| puser.rows[0].img_url
            maxqual = maxqual||puser.rows[0].maxqualification
            bio = bio || puser.rows[0].bio
            await db.query("UPDATE profile SET name = $1, gender = $2, age = $3, bloodgroup = $4, experience = $5, maxqualification = $6, img_url = $7, bio = $8 WHERE userid = $9", [name, gender, age, bloodgroup, experience, maxqual,img_url, bio ,userid]);
            res.send("info updated")
        }
    
    }
    catch(error){
        console.log("Error",error)
        res.status(500).send("error",error)
    }
   
}