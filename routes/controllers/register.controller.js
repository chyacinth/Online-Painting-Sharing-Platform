var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = require('../../dbconf/pool.js');
var sql = require('../../dbconf/sqlMapping.js');
var jsonWrite = require('../../dbconf/jsonWrite.js');
const fs = require('fs-extra');

router.get('/', index);
router.post('/reg', register);

//get
function index(req, res, next) {

    var userID = req.session.userID;
    res.render('register');
    /*if (!(userID)) { //user not login
        res.render('register');
        return;
    }
    else
    {
        res.redirect('/homepage'); //which website?
    }*/
}


// assume the front-end sends the following when the user registers:
// username,type,password,alipay_address
// alipay_address can be null
// the attribute in the req.body should be the same as the on in database

//Post
function register(req, res, next) {
    var user = req.body;
    var status = 0;
    var message = '';
    pool.getConnection(function(err, connection) {
        if (err) {
            // handle error
            status = 0;
            message = 'Failed to connect to database';
            res.json({
                status : status,
                msg: message
            });
            return;
        }
        connection.query(
            sql.addUser, [user.username, user.usertype, user.password, user.alipay_address],
            function(err, result) {
                connection.release();
                if (err) {
                    // handle error
                    status = 0;
                    message = err.code + ' ' + err.sqlMessage;
                }
                if (result) {
                    status = 1;
                    message = 'Successfully signed up!';
                    fs.copy(__dirname + '/../../public/img/default_header.png', __dirname + '/../../public/img/header/' + (result[1][0].userID).toString() + '.png',
                        function(err) {
                            if (err)
                            {
                                status = 0;
                                message = 'Failed to rename the profile image';
                            }
                            else {
                                status = 1;
                                message = 'Successfully signed up!';
                            }
                        });
                }
                res.json({status:status, msg:message});
                return;
            }
        );
    });
}
//session
// userID = req.session.userID;


// res.send
// res.render
// res.json




module.exports = router;