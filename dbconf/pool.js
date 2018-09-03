var mysql = require('mysql');

//创建连接池
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbproject',
    port: 3306,
    multipleStatements: true,
    connectionLimit: 150
});
module.exports = pool;
