var con = require('../../../config/database');
var GLOBALS = require('../../../config/constant');

var API = {

    /**
     * Function to get api users list
     * 04-06-2021
     * @param {Function} callback 
     */
    apiuserList: function (callback) {

        con.query("SELECT u.*,IFNULL(d.token,'')as token, IFNULL(d.device_type,'')as device_type, IFNULL(d.device_token,'')as device_token FROM  tbl_user as u LEFT JOIN  tbl_device as d ON u.id = d.user_id JOIN tbl_fitness_goal as f ON u.id=f.id", function (err, result, fields) {
            if (!err) {
                callback(result);
            } else {
                callback(null, err);
            }
        });
    },
}

module.exports = API;