require('dotenv').config();

var express = require('express');
var conn = require('./config/database')

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/v1/api_document/',require('./modules/v1/api_document/index'));

var auth = require('./modules/v1/Auth/route');
// app.use('/',require('./middleware/validators').decryption);
app.use('/',require('./middleware/validators').extractHeaderLanguage);
app.use('/',require('./middleware/validators').validateApiKey);
app.use('/',require('./middleware/validators').validateHeaderToken);
// app.use('/',require('./middleware/validators').sendmail);

app.use("/api/v1/auth",auth);
try {
    app.listen(process.env.port)
    console.log("server connected")
} catch (error) {
    console.log("fail");
}
