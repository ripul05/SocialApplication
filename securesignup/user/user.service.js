const Express = require("express")
const db = require("../dbConnection.js");
const { emit } = require("nodemon");


exports.generateOtp = function(){
    const max = 999999;
    const min = 100000;

    return (Math.floor(Math.random()*(max-min+1)))
}

exports.addUserOtp = async function (email) {
    const otp = exports.generateOtp();
    const time = new Date();

    try {
        const vuser = await db.query("SELECT * FROM otptable WHERE email = $1", [email]);

        if (vuser.rowCount > 0) {
            // console.log("Old user", otp);
            
            const tabTime = vuser.rows[0].ctime
            const tlapse = time-tabTime
            console.log(tlapse/60000)
            console.log(vuser.rows[0].verified)
            if(vuser.rows[0].verified){
               
                return "AV"//already verified
            }
           
            
            else{
                if(tlapse>300000){
                    console.log("New Otp for your verification is",otp)
                    await db.query("UPDATE otptable SET otp = $1, ctime = $2 WHERE email = $3", [otp, time, email]);
                    return "otpsent"
    
                }
                else{
                    console.log("Otp already sent")
                    return "AO"//otp already sent and time lapse is less than 5 minutes
                }
            }
            
            
        } else {
            console.log("New User");
            await db.query("INSERT INTO otptable (email, otp, ctime) VALUES ($1, $2, $3)", [email, otp, time]);
            return "newEntry"
        }
    } catch (error) {
        console.log("An error occurred", error);
    }
}

// exports.addUserOtp("ripul@gmail.com")

exports.verifyUser = async function(email,otp){
    try{
        const vuser = await db.query('SELECT * FROM userdetails WHERE email = $1', [email]);
        if(vuser.rowCount>0){
            const vuser=await db.query(`Select * from otptable where email = '${email}'`);

            const tabotp = vuser.rows[0].otp
            const tabtime = vuser.rows[0].ctime

            // console.log(tabotp)
            // console.log(tabtime)

            const currtime = new Date()
            const timelapse = currtime-tabtime
                        if(timelapse<300000){
                
                if(tabotp==otp){
                    console.log("Otp matched")
                    return "true"
                }
                else{
                    console.log("Incorrect OTP")
                    return "false"
                }
                
            }
            else{
                console.log("OTP Expired")
                return "false"
            }
        }
        else{
            console.log("User does not exists please signup")
            return "false"
        }

        
    }
    catch(error){
        console.log("An error occured", error)
        return "false"
    }
}



exports.timediff=function(time){
    const currtime = new Date()
    
    const tlapse = currtime - time
    if(tlapse<300000){
        console.log("The time lapsed is ", tlapse)
        // return tlapse
    }
    else{
        // return tlapse
        console.log("Time lapsed is too much")
    }
}
const timepass = new Date()
// exports.timediff(timepass)

