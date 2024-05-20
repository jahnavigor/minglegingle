var mysql=require('mysql');

conn={
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME,
    dateStrings:'date'
}
var database=mysql.createPool(conn);
module.exports=database;