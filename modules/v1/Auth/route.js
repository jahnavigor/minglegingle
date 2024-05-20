  var express = require('express');
var router = express.Router();
var auth_model = require('./auth_modules');
var middleware = require('../../../middleware/validators');
var common = require('../../../config/common');
const { profile_pic } = require('../../../config/constant');

router.post("/signup", function (req, res) {
    // console.log("jahnavi")
    var request = req.body;
    var rules = {
        login_type: 'required|in:s,f,g',
        email: 'required_if:login_type,s',
        first_name:'required',
        surname:'required',
        nationality:'required',
        country_code:'required',
        number: 'required_if:login_type,s',
        password: 'required_if:login_type,s',
        device_type: 'required|in:a,i',
        device_token: 'required',
        social_id: 'required_if:login_type,f,g,a',
        os_version:'required',
        device_name:'required',
        model_name:'required',
        role:'required'
    }
    var message = {
        "required": 'Please enter :attr'
    }
    if (middleware.checkValidationRules(res, request, rules, message)) {
        // console.log("jahnavi")
        auth_model.signup(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
});
router.post('/otp_verification',function(req,res){
    const request=req.body;
    const rules={
    user_id:'required',
    otp:'required'
    };
    const messages = {
      required: 'Please enter :attr'
  };
  if (middleware.checkValidationRules(res, request, rules, messages)) {
      auth_model.otp_verification(request, function (code, message, data) {
          middleware.send_response(req, res, code, message, data);
      });
  }
  });
  
router.put("/resend_otp", function (req, res) {

    var request = req.body;

    var rules = {
        user_id: 'required'
    }

    var message = {
        required: 'required'
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth_model.resend_otp(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
});

router.post("/login", function (req, res) {
    var request = req.body;
    var rules = {
        social_id : 'required_if:login_type,f,g,a',
        emailphone : 'required_if:login_type,s',
        password : 'required_if:login_type,s',
        login_type : 'required|in:s,f,g,a'
    }

    var message = {
        required:'please enter :attr'
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth_model.login(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
});
router.get('/logout',function(req,res){
    var request = req.user_id;
    //   console.log("jahnavii");
    auth_model.logout(request, function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    });
  });

router.post('/complete_profile',function(req,res){
  var request = req.body;
  request.user_id = req.user_id;

  var rules = {
    bio:'required',
    profile_pic:'required',
    hobbies:'required',
   preferences:'required',
  }

  var message = {
      required : 'please enter:attr'
  }

  if(middleware.checkValidationRules(res,request,rules,message))
  {
      auth_model.complete_profile(request, function(code,message,data){
          middleware.send_response(req,res,code,message,data);
      });
  }
});
router.put("/forgetpassword", function(req, res) {
    console.log("fighodiungjd")
 var request = req.body;
 var rules = {
     email: 'required|email',
 }

 var message = {
   required:'please enter:attr'
 }

 if (middleware.checkValidationRules(res, request, rules, message)) {
     console.log("ugihjfdklwkergbf nv")
     auth_model.forgetpassword(request, function(code, message, data){
         middleware.send_response(req, res, code, message, data);
     });
 }
});
router.put("/change_password", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
      oldpassword: "required",
      newpassword: "required",
      confirmpassword: "required"
    }
    var message = {
      "required": 'Required :attr',
    }
  console.log("jahnavi")
  if (middleware.checkValidationRules(res, data, rules, message)) {
    auth_model.change_password(request, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/cafe_insert", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
      name: "required",
      cafe_image:"required",
      cafe_time:"required",
      location:"required",
      latitude:"required",
      longitude:"required"
    }
    var message = {
      "required": 'Required :attr',
    }
  console.log("jahnavi")
  if (middleware.checkValidationRules(res, data, rules, message)) {
    auth_model.cafe_insert(request, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.get("/search_places", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
      user_latitude: "required",
      user_longitude:"required"
    }
    var message = {
      "required": 'Required :attr',
    }
  if (middleware.checkValidationRules(res, data, rules, message)) {
    auth_model.search_places(request, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/check_in", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     cafe_id:"required",
     schedule_date:"required",
     schedule_time:'required'
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules, message)) {
    auth_model.check_in(request, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/peoplechecked_in", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     cafe_id:"required",
     schedule_date:"required",
     schedule_time:'required'
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules,message)) {
    auth_model.peoplechecked_in(request, function (code,message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/deal_insert", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     cafe_id:"required",
     image:"required",
     name:'required',
     description:'required',
     coupen:'required'
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules,message)) {
    auth_model.deal_insert(request, function (code,message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/listing_deals", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     cafe_id:"required"
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules,message)) {
    auth_model.listing_deals(request, function (code,message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/deal_description", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     deal_id:"required"
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules,message)) {
    auth_model.deal_description(request, function (code,message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.get('/profile',function(req,res){
    var request = req.user_id;
    //   console.log("jahnavii");
    auth_model.profile(request, function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    });
  });
  router.post("/contact_us", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     name:"required",
     surname:'required',
     description:'required'
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules,message)) {
    auth_model.contact_us(request, function (code,message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/blocked_user", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     block_id:"required"
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules,message)) {
    auth_model.blocked_user(request, function (code,message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    }
  ),
  router.post("/follower", function (req, res) {
    var user_id = req.user_id;
    var data = req.body
    var request = { "user_id": user_id, "data": data }
    var rules = {
     follow_id:"required"
    }
    var message = {
      "required": 'Required :attr',
    }
    console.log("jahnavi");
  if (middleware.checkValidationRules(res, data, rules,message)) {
    auth_model.follower(request, function (code,message, data) {
        middleware.send_response(req, res, code, message, data);
    })
  }
    },
  ),
  router.get('/following',function(req,res){
    var request = req.user_id;
    //   console.log("jahnavii");
    auth_model.following(request, function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    });
  });



 

module.exports = router;