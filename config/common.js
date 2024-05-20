var conn = require('../config/database');
var constant = require('../config/constant');
const { param } = require('../modules/v1/Auth/route');
const asyncLoop = require('node-async-loop');
const middleware = require('../middleware/validators');
var nodemailer = require('nodemailer');
const GLOBALS = require('../config/constant');
const { kebabCase } = require('lodash');

var common = {
    send_response: function (req, res, code, message, data) {
        res_data = {
            code: code,
            message: message,
            data: data
        }
        res.status(200);
        res.send(res_data);
        // middleware.encryption(res_data, function (encrypt) {
        //     res.status(200);
        //     res.send(res_data);
        // })
    },
    sendEmail: function(to_email, subject, message, callback) {

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    
        var mailOptions = {
            from: process.env.EMAIL_ID,
            to: to_email,
            subject: subject,
            html: message
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                callback(true);
            } else {
                console.log('Email sent: ' + info.response);
                callback(true);
            }
        });
    },
    checkemailused: function (request, callback) {
        conn.query(`select * from tbl_user where email='${request.email}'`, function (error, result) {
            if (!error && result.length > 0) {
                callback(true)
            } else {
                callback(false)
            }
        })
    }, validateEmail(email) {
        var rej = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return rej.test(email);
    },
    generateotp: function () {
        return Math.floor(1000 + Math.random() * 9000);
    },
    generatetoken(length = 64) {
        var possible = 'qwertyuioplkjhgfdsazxcvbnm@123456789';
        var text = "";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },
    checkphoneused: function (request, callback) {
        conn.query(`select * from tbl_user where number='${request.number}'`, function (error, result) {
            if (!error && result.length > 0) {
                callback(true)
            } else {
                callback(false)
            }
        })
    },
   
    checkdevice: function (user_id, request, callback) {
        // console.log(request,"...............................");
        var devicedata = {
          user_id:user_id,
            token: (request.token =="")?request.token:common.generatetoken(),
            device_type: (request.device_type != undefined) ? request.device_type : "",
            device_token: (request.device_token != undefined) ? request.device_token : "",
            os_version: (request.os_version != undefined) ? request.os_version : "",
            device_name: (request.device_name != undefined) ? request.device_name : "",
            model_name: (request.model_name != undefined) ? request.model_name : "",
            role:request.role
        }

        console.log(devicedata,"......................................");
        conn.query("SELECT * FROM tbl_device WHERE user_id = ?", [user_id], function (error, result) {
            console.log(this.sql);
            console.log(error)
            if (!error && result.length > 0) {
                // console.log("jahnavi")
                conn.query("UPDATE tbl_device SET ? WHERE user_id = ?;", [devicedata, user_id], function (error1, result1) {
                    if (!error1 && result1.affectedRows > 0) {
                        // console.log(result1)
                        callback(result1)
                        // callback('1',{keyword:'data'},result1);
                    } else {
                        // console.log(this.sql,"error");
                        callback(error1);
                    }
                })
            } else {
                if (error) {
                    callback(error);
                } else {
                    devicedata.user_id = user_id;
                    // console.log("jahnavi1")
                    conn.query("INSERT INTO tbl_device SET ?", [devicedata], function (error3, result3) {
                        if (error3) {
                            callback(error3);
                        } else {
                            callback(result3);
                        }
                    })
                }
            }
        })
    },

    
    sendSMS: function (mobile_number, message, callback) {
        if (mobile_number != '' && mobile_number != undefined) {
          const client = require('twilio')(GLOBALS.TWILLIO_ACCOUNT_SID,GLOBALS.TWILLIO_ACCOUNT_AUTH);
          client.messages
            .create({
              body: message,
              from:GLOBALS.TWILLIO_ACCOUNT_PHONE,
              to:`+917575045028`
            })
            .then((message) => {
              callback(true);
            })
            .catch((e) => {
                console.log(e);
              callback(false);
            });
        } else {
          callback(true);
        }
      },
      getcafedetails:function(cafe_id,callback){
        conn.query(`select * from tbl_cafe where id=?`,[cafe_id],function(error,result){
            if(!error && result.length>0){
                callback(result);
            }else{
                callback(error);
            }
        })
      },
      getuserdetails: function (user_id, callback) {
        conn.query(`SELECT tu.*,CONCAT('` + constant.profile_pic + `', tu.profile_pic) AS profile_pic , IFNULL(tud.token,'')as token, IFNULL(tud.device_type,'')as device_type, IFNULL(tud.device_token,'')as device_token FROM  tbl_user as tu LEFT JOIN  tbl_device as tud ON tu.id = tud.user_id   WHERE tu.id =?`,[user_id] ,function (error, user) {
            if (!error && user.length > 0) {
                asyncLoop(user,(item,next)=>{
                    var query1=`select * from tbl_hobbies where FIND_IN_SET(tbl_hobbies.id,?)`;
                    conn.query(query1,[item.hobby_id],function(nestedError1,nestedResult1){
                        item.hobby_id=nestedResult1;
                        next();
                    })
                console.log("async")
                },(error=>{
                    // console.log(error)
                    callback(user[0]);
                }))
            } else {

                callback(null);
            }
        }
        )
    },
    getcheckin:function(checkin_id,callback){
        conn.query(`select * from tbl_checkin where id=?`,[checkin_id],function(error,result){
            if(!error && result.length>0){
                console.log("aqwsdfghjkl",result)
                callback(result);
            }else{
                callback('0',{keyword:'wrong'},{});
            }
        })
    }
   
  


}
module.exports = common;