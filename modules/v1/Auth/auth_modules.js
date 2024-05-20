var conn = require('../../../config/database');
var common = require('../../../config/common');
var constant = require('../../../config/constant');
var asyncLoop = require("node-async-loop");
var md5 = require("md5");
const { request } = require('express');
const { use } = require('./route');
const { otp_verified } = require('../../../language/en');
var template = require('../../../config/template');
const GLOBALS = require('../../../config/constant');
const messages = require('../../../language/en');
const { callbackPromise } = require('nodemailer/lib/shared');
const { errorMonitor } = require('nodemailer/lib/xoauth2');
const { keyBy } = require('lodash');

var Auth = {
  signup: function (request, callback) {
    common.checkemailused(request, function (isused) {
      if (isused) {
        callback('0', { keyword: 'rest_keywords_unique_email_error' }, {})
      } else {
        common.checkphoneused(request, function (isused) {
          if (isused) {
            callback('0', { keyword: 'rest_keywords_unique_number_error' }, {})
          } 
            // common.checkusername(request, function (isused) {
              // if (isused) {
              //   callback('0', { keyword: 'rest_keyword_unique_username' }, {})
              // } 
              else {
                // console.log("jahnavi")
                let insertobj = {
                  login_type: request.login_type,
                  social_id: (request.login_type != 's') ? request.social_id : '',
                  first_name: request.first_name,
                  surname:request.surname,
                  nationality:request.nationality,
                  email: (request.login_type == 's') ? request.email : "",
                  country_code: request.country_code,
                  number: request.number,
                  otp: common.generateotp(),
                  nickname:request.nickname,
                  role:request.role
                }
                if (request.login_type == 's') {
                  insertobj.password = md5(request.password);
                }
                if (request.login_type != 's') {
                  insertobj.is_verified = '1'
                }
                conn.query(`insert into tbl_user set ?`, [insertobj], function (error, result) {
                  console.log(error)
                  if (!error && result.affectedRows > 0) {
                    template.welcomeEmail(insertobj, function (welcomeEmail) {
                      common.sendEmail(request.email, "otp verification", welcomeEmail, function (issent) {
                        // console.log("issent")
                        common.checkdevice(result.insertId, request, (deviceinfo) => {
                          // console.log(deviceinfo)
                          common.getuserdetails(result.insertId, (user) => {
                            console.log(user)
                            if (user == null) {
                              callback('2', { keyword: 'data_not_found' }, {})
                            } else {
                              callback('1', { keyword: 'success' }, user)
                            }
                          })
                        })
                      })
                    })

                  } else {
                    callback('0', { keyword: 'wrong' }, {})
                  }
                })
              }
            // })

          
        })
      }
    })
  },
  otp_verification: function (request, callback) {
    common.getuserdetails(request.user_id, (user) => {
        if (user == null) {
            callback('0', { keyword: 'invalid_email' });
        } else {
            if (user.otp == request.otp) {
                var makeverification = {
                    is_verified: '1',
                }
                conn.query(`update tbl_user set ? where id='${request.user_id}'`, [makeverification], function (error, result) {
                    if (!error && result.affectedRows > 0) {
                        // var token = {
                        //     token: common.generatetoken()
                        // }
                        // console.log("jahnavi")
                        common.checkdevice(request.user_id,request, (deviceinfo) => {
                            console.log("9'uifhn d")
                            common.getuserdetails(request.user_id, (userInfo) => {
                                callback('1', { keyword: 'otp_verified' }, userInfo)
                            })
                        })
                    }
                })
            } else {
                callback('0', { keyword: 'otp_not_match' }, {})
            }
        }
    })
},
  resend_otp: function (request, callback) {
    common.getuserdetails(request.user_id, (userdetails) => {
      if (userdetails == null) {
        callback('0', { keyword: 'invalid_number' }, {})
      } else {
        var otp = common.generateotp()
        // userdetails[0].otp = otp
        // var data = { otp: otp }
        var phone_no = userdetails.country_code + userdetails.number;
        common.sendSMS(phone_no, 'your otp is:' + otp, (issend) => {
          var obj = {
            otp: otp,
            otp_timestamp: new Date()
          }
          conn.query(`update tbl_user set ? where id='${request.user_id}'`, [obj], function (error, result) {
            if (!error && result.affectedRows > 0) {
              common.getuserdetails(request.user_id, (user) => {
                if (user == null) {
                  callback('0', { keyword: 'wrong' }, {})
                } else {
                  callback('1', { keyword: 'otp_sent' }, {})
                }
              })
            } else {
              callback('1', { keyword: 'otp_sent' }, {})
            }
          })
        })
      }
    })
  },
  login: function (request, callback) {
    console.log(request.login_type)
    if (request.login_type == 's') {
      condition = ` (email = '${request.emailphone}' OR number = '${request.emailphone}') AND password = '${md5(request.password)}' AND login_type='s'`;
    } else {
      condition = `social_id = '${request.social_id}' AND login_type != 's'`
    }
    loginData = `SELECT * FROM tbl_user WHERE  ${condition} AND is_active = 1 AND is_delete = 0 `
    conn.query(loginData, function (error, result) {
      //  console.log("gyfhujdkldkn")
      console.log(this.sql)
      console.log(result)
      console.log(error)
      if (!error && result.length > 0) {
        if (result[0].is_verified != '1') {
          callback('4', { keyword: 'not_verified' }, {});
        } else {
          common.checkdevice(result[0].id, request, (userdeviceInfo) => {
            common.getuserdetails(result[0].id, (userInfo) => {
              // console.log(result[0].id)
              // console.log(userInfo)
              if (userInfo == null) {
                callback('2', { keyword: 'data_not_found' }, [])
              } else {
                conn.query(`update tbl_user set is_online='1' where id=?`, [result[0].id], function (error1, result1) {
                  console.log(error1, result1)
                  if (!error1 && result1.affectedRows > 0) {
                    callback('1', { keyword: 'success_login' }, userInfo);
                  } else {
                    callback('0', { keyword: 'wrong' }, {})
                  }
                })
              }
            })
          })
        }
      } else {
        if (error) {
          callback('0', { keyword: 'wrong' }, []);
        } else {
          callback('2', { keyword: 'data_not_found' }, []);
        }
      }
    })
  },
  logout: function (request, callback) {
    // console.log("jahnavi");
    var userdevice = {
      device_token: "",
      token: ""
    }
    common.checkdevice(request, userdevice, (deviceInfo) => {

      common.getuserdetails(request, (userInfo) => {
        console.log(userInfo)
        console.log(request)
        if (userInfo == null) {
          callback('2', { keyword: 'data_not_found' }, [])
        } else {
          var data = {
            is_online: '0'
          }
          conn.query(`update tbl_user set ? where id='${request}'`, [data], function (error, result) {
            if (!error && result.affectedRows > 0) {
              callback('1', { keyword: 'logout' }, result)
            } else {
              callback('0', { keyword: 'logout_fail' }, {})
            }
          })

        }

      })
    })
  },
complete_profile:function(request,callback){
var data={
  bio:request.bio,
  profile_pic: request.profile_pic ? request.profile_pic : 'default_img.jpg',
  hobbies:request.hobbies,
 preferences:request.preferences,
}
conn.query(`update tbl_user set ? where id='${request.user_id}'`,[data],function(error,result){
  console.log(this.sql);
  console.log(error,result);
  if(!error && result.affectedRows>0){
    common.getuserdetails(request.user_id,(userinfo)=>{
      console.log(userinfo);
      if(userinfo==null){
        callback('0', { keyword: 'wrong' }, {})
      }else{
        callback('1', { keyword: 'success_update' }, {})
      }
    })
  }else{
    callback('0', { keyword: 'wrong' }, {})
  }
})
},
forgetpassword: function (request, callback) {
  conn.query(`select * from tbl_user where email='${request.email}'`, function (error, data) {
    if (error) {
      callback('0', { keyword: 'rest_keywords_unique_email_error' }, {})
    } else
      if (data.length > 0) {
        var user = data[0]
        var insertdata = {
          email: request.email,
          token: common.generatetoken()
        }
        console.log("jahnavi")
        conn.query(`Insert into pass_reset SET ?`, insertdata, function (error, result) {
          if (!error && result.affectedRows > 0) {
            //  console.log(result)
            user.url = GLOBALS.BASE_URL + "/verification/resetPassword.php?token=" + insertdata.token
            template.forgotPassword(user, function (result) {
              common.sendEmail(user.email, "forget password", result, (issent) => {
                if (issent == true) {
                  callback('1', { keyword: 'password_change' }, {})
                } else {
                  callback('0', { keyword: 'wrong' }, {})
                }
              })
            })
          } else {
            callback('0', { keyword: 'wrong' }, {})
          }
        })
      } else {
        callback('0', { keyword: 'wrong' }, {})
      }
  })
},
change_password: function (req_data, callback) {
  conn.query(`SELECT * FROM tbl_user WHERE password='${md5(req_data.data.oldpassword)}' AND is_verified='1' AND login_type='s'`, function (error, result) {
      if (!error && result.length > 0) {
          if (md5(req_data.data.oldpassword) != md5(req_data.data.newpassword)) {
              if (md5(req_data.data.newpassword) == md5(req_data.data.confirmpassword)) {
                  conn.query(`UPDATE tbl_user SET password='${md5(req_data.data.newpassword)}' WHERE password='${md5(req_data.data.oldpassword)}';
                  `, function (error1, result1) {
                      if (!error1 && result1.affectedRows > 0) {
                          callback('1', { keyword: 'password change' });
                      }
                      else {
                          callback('0', { keyword: 'wrong' });
                      }
                  })

              }
              else {
                  callback('0', { keyword: 'password not match' });
              }
          } else {
              callback('1', { keyword: 'password match' });
          }
      }
  })
},
cafe_insert:function(request,callback){
var cafe={
  name:request.data.name,
  cafe_image:request.data.cafe_image,
  cafe_time:request.data.cafe_time,
  location:request.data.location,
  latitude:request.data.latitude,
  longitude:request.data.longitude
}
conn.query(`Insert into tbl_cafe set ?`,[cafe],function(error,result){
  if(!error && result.affectedRows>0){
    common.getcafedetails(result.insertId,(cafedetails)=>{
      if(cafedetails==null){
        callback('0',{keyword:'wrong'},{});
      }else{
        callback('1',{keyword:'success'},cafedetails)
      }
    })
    
  }else{
    callback('0',{keyword:'wrong'},{});
  }
})
},
search_places:function(request,callback){
  conn.query(`select *,Round(( 6371 * acos( cos( radians('${request.data.user_latitude}') ) 
  * cos( radians(latitude ) ) 
  * cos( radians(longitude) - radians('${request.data.user_longitude}') ) 
  + sin( radians('${request.data.user_latitude}') ) 
  * sin( radians(latitude) ) ) ),2) AS distance from tbl_cafe order BY distance `,function(error,result){
    console.log(error,result);
    if(!error && result.length>0){
      callback('1',{keyword:'data'},result);
    }else{
      callback('0',{keyword:'wrong'},{});
    }
  })
},
check_in:function(request,callback){
  var checkin={
    user_id:request.user_id,
    cafe_id:request.data.cafe_id,
    schedule_date:request.data.schedule_date,
    schedule_time:request.data.schedule_time
  }
  conn.query(`Insert into tbl_checkin set ?`,[checkin],function(error,result){
    // console.log(error,result)
    if(!error && result.affectedRows>0){
      common.getcheckin(result.insertId,function(checkdate){
        console.log('hey',checkdate[0]);
        if(checkdate==null){
          callback('2',{keyword:'data_not_found'},{})
        }else{
          callback('1',{keyword:'date'},checkdate);
        }
      })
    }else{
      callback('0',{keyword:'wrong'},{});
    }
  })
},
peoplechecked_in:function(request,callback){
conn.query(`SELECT c.*, u.first_name, u.profile_pic FROM tbl_checkin AS c JOIN tbl_user AS u ON u.id = c.user_id
WHERE c.schedule_date = ? AND c.schedule_time = ? AND c.cafe_id = ?`,[request.data.schedule_date,request.data.schedule_time,request.data.cafe_id],function(error,result){
  console.log(this.sql);
  console.log(error,result)
  if(!error && result.length>0){
 callback('1',{keyword:'data'},result)
  }else{
    callback('2',{keyword:'data_not_found'},{})
  }
})
},
deal_insert:function(request,callback){
  var deal={
    cafe_id:request.data.cafe_id,
    user_id:request.user_id,
    image:request.data.image,
    name:request.data.name,
    description:request.data.description,
    coupen:request.data.coupen
  }
  conn.query(`Insert into tbl_deal set ?`,[deal],function(error,result){
    console.log(error,result)
    if(!error && result.affectedRows>0){
      conn.query(`select * from tbl_deal where id=?`,result.insertId,function(error1,result1){
        if(!error1 && result1.length>0){
          callback('1',{keyword:'data'},result1)
        }else{
          callback('2',{keyword:'data_not_found'},{})
        }
      })
    }else{
      callback('0',{keyword:'wrong'},{})
    }
  })
},
listing_deals:function(request,callback){
  conn.query(`SELECT d.id, d.image, d.name FROM tbl_deal AS d WHERE d.cafe_id = 
  '${request.data.cafe_id}'`,function(error,result){
    console.log(error,result)
    if(!error && result.length>0){
         callback('1',{keyword:'data'},result)
    }else{
      callback('2',{keyword:'data_not_found'},{})
    }
  })
},
deal_description:function(request,callback){
  conn.query(`select * from tbl_deal where id='${request.data.deal_id}'`,function(error,result){
    console.log(error,result)
    console.log(this.s)
    if(!error && result.length>0){
      callback('1',{keyword:'data'},result)
    }else{
      callback('2',{keyword:'data_not_found'},{})
    }
  })
},
profile:function(request,callback){
  common.getuserdetails(request,(user)=>{
    if(user==null){
      callback('2',{keyword:'data_not_found'},{})
    }else{
      callback('1',{keyword:'data'},user)
    }
  })
},
contact_us:function(request,callback){
  var data={
    name:request.data.name,
    surname:request.data.description,
    description:request.data.description
  }
  conn.query(`Insert into tbl_contact_us set ?`,[data],function(error,result){
    if(!error && result.affectedRows>0){
      callback('1',{keyword:'success'},result);
    }else{
      callback('0',{keyword:'wrong'},{})
    }
  })
},
blocked_user:function(request,callback){
  var data={
    user_id:request.user_id,
    block_id:request.data.block_id
  }
  conn.query(`Insert into tbl_blocked_user set ?`,[data],function(error,result){
    if(!error && result.affectedRows>0){
      callback('1',{keyword:'data'},result)
    }else{
      callback('0',{keyword:'wrong'},{})
    }
  })
},
follower:function(request,callback){
  conn.query(`SELECT u.id,u.first_name,u.surname
  FROM tbl_user u
  JOIN tbl_follow uf ON uf.user_id = u.id
  WHERE uf.follow_id = '${request.data.follow_id}' AND u.is_active = "1" AND u.is_delete = "0"`,function(error,result){
    console.log(error,result);
    if(!error && result.length>0){
      callback('1',{keyword:'data'},result)
    }else{
      callback('0',{keyword:'wrong'},{})
    }
  })
},
following:function(request,callback){
  conn.query(`SELECT u.id,u.first_name,u.surname
  FROM tbl_user u
  JOIN tbl_follow uf ON uf.follow_id = u.id
  WHERE uf.user_id = '${request}' AND u.is_active = "1" AND u.is_delete = "0"`,function(error,result){
    console.log(error,result);
    if(!error && result.length>0){
      callback('1',{keyword:'data'},result)
    }else{
      callback('0',{keyword:'wrong'},{})
    }
  })
}
}
module.exports = Auth;