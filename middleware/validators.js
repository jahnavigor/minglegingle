// const Validators = require('validator');Validators
const Validator = require('validator');



var conn = require('../config/database');

const {default : localizify}= require('localizify');
var en = require('../language/en');
var guj = require('../language/guj');
const { t } = require('localizify');


var bypassMethods = new Array("signup","login","otp_verification","resend_otp","change_password","forgetpassword");
var middleware = {
    extractHeaderLanguage:function(req,res,callback){
        var headerlang = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != "") ? req.headers['accept-language']:'en';
        req.lang = headerlang;
        req.language = (headerlang == 'en') ? en : guj;
    
        localizify
        .add('en',en)
        .add('guj',guj)
        .setLocale(headerlang);
    
        callback();
    },
    // extractHeaderLanguage: function(req, res, callback) {
    //     var headerlang = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != "") ? req.headers['accept-language'] : 'en';
    //     req.lang = headerlang;
        
    //     var en = {rest_keywords_unique_email_error:" This email is aldready being used.",
    //     rest_keywords_unique_number_error:"This number aldready being used",
    //     otp_verified:"your otp is verified,now you are authorized to proceed further",
    //      not_verified:'kindly please first verify your otp to proceed further',
    //     required:':attr field is required ',
    //      success_update:"congratulations! your data is sucessfully updated",
    //      otp_not_match:"your otp is not matched kindly check it once",
    //      logout_fail:"Due to some error your logout is pending",
    //      logout:"you're successfully logout from your device",
    //      otp_sent:"your otp is sent to your device kindly check it and do not share it with anyone",
    //     data:"data",
    //     success_login:"you have successfully login to your account",
    //      password_change:"congratulations! your password is changed successfully",
    //      sucess_insert:"congratulations! your data is successfully inserted",
    //     success:"you have successfully signup",
    //     wrong:'something went wrong',
    //     profile_not_updated:"you need to first complete your profile",
    //     password_check:"this password does not exist",
    //     success:'sucessfully  your data is inserted',
    //     date:'you haved successfully scheduled your date',
    //     data_not_found:'data not found'
    
    // };
    //     var ita = {
    //         rest_keywords_unique_email_error: "Questa email è già in uso.",
    //         rest_keywords_unique_number_error: "Questo numero è già in uso.",
    //         otp_verified: "Il tuo codice OTP è verificato, ora sei autorizzato a procedere ulteriormente.",
    //         not_verified: "Per favore, verifica prima il tuo codice OTP per procedere ulteriormente.",
    //         required: "Il campo :attr è obbligatorio.",
    //         success_update: "Congratulazioni! I tuoi dati sono stati aggiornati con successo.",
    //         otp_not_match: "Il tuo codice OTP non corrisponde, controllalo nuovamente.",
    //         logout_fail: "A causa di un errore, il logout è in sospeso.",
    //         logout: "Sei stato disconnesso con successo dal tuo dispositivo.",
    //         otp_sent: "Il tuo codice OTP è stato inviato al tuo dispositivo, controllalo e non condividerlo con nessuno.",
    //         data: "Dati",
    //         success_login: "Hai effettuato l'accesso al tuo account con successo.",
    //         password_change: "Congratulazioni! La tua password è stata cambiata con successo.",
    //         sucess_insert: "Congratulazioni! I tuoi dati sono stati inseriti con successo.",
    //         success: "Ti sei registrato con successo.",
    //         wrong: "Qualcosa è andato storto.",
    //         profile_not_updated: "Devi completare prima il tuo profilo.",
    //         password_check: "Questa password non esiste.",
    //         success: "I tuoi dati sono stati inseriti con successo.",
    //         date: "Hai programmato con successo il tuo appuntamento.",
    //         data_not_found: "Dati non trovati."
            
    //     };
        
        
    //     req.language = (headerlang == 'en') ? en : ita;
    //     localizify
    //         .add('en', en)
    //         .add('ita', ita)
    //         .setLocale(headerlang);
    
    
    //     callback();
    // },
    validateApiKey: function (req, res, callback) {

        var api_key = (req.headers['api-key'] != undefined || req.headers['api-key'] != "") ? req.headers['api-key'] : '';

        if (api_key != "") {
            if(api_key=process.env.api_key){
                callback();
            }
        } else {
            response_data = {
                code: '0',
                message: "Invalid Api key"
            }
            res.status(401);
            res.send(response_data);
        }
    },
    validateHeaderToken: function (req, res, callback) {
        var headertoken = (req.headers['token'] != undefined && req.headers['token'] != "") ? req.headers['token'] : '';
        var path_data = req.path.split("/");
        console.log(path_data);
        if (bypassMethods.indexOf(path_data[4]) === -1) {
            if (headertoken != "") {
                try {
                    var dec_token = req.headers['token'];
                    if (dec_token != "") {
                        conn.query("select * from tbl_device where token = ?", [dec_token], function (error, result) {
                            if (!error && result.length > 0) {
                                // console.log(result[0].action_id,"vvvvvvvvvvvvvvvv");
                                req.user_id = result[0].user_id;
                                callback();
                            } else {
                                response_data = {
                                    code: '0',
                                    message: "Invalid token provided"
                                }
                                res.status(401);
                                res.send(response_data);
                            }
                        });
                    }
                    else {
                        response_data = {
                            code: '0',
                            message: "Invalid token provided"
                        }
                        res.status(401);
                        res.send(response_data);
                    }
                } catch (error) {
                    response_data = {
                        code: '0',
                        message: "Invalid token provided"
                    }
                    res.status(401);
                    res.send(response_data);
                }
            }
        }
        else{
            callback()
        }
    }

    ,
    checkValidationRules: function (res, request, rules, message) {
        
        const v = Validator.make(request, rules, message);
        if (v.fails()) {
            const errors = v.getErrors();
            console.log(errors);
            var error = "";
            for (var key in errors) {
                error = errors[key][0];
                break;
            }
            response_data = {
                code: "0",
                message: error,
            }
            res.status(200);
            res.send(response_data);
            return false;
        }
        else {
            return true;
        }
    },
    send_response: function (req, res, code, message, data) {
        this.getMessage(req.lang,message,function(translated_message){
            response_data = {
                code: code,
                message: translated_message,
                data: data
            }
            res.status(200);
            res.send(response_data);
        });        
    },
    getMessage:function(language,message,callback){
        // localizify
        // .add('en',en)
        // .add('guj',guj)
        // .setLocale(language);
        callback(t(message.keyword,message.content));
    },
};


module.exports = middleware