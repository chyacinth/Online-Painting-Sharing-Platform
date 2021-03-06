var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = require('../../dbconf/pool.js');
var sql = require('../../dbconf/sqlMapping.js');
var fs = require('fs');

var path = require('path');
var multer = require('multer');
var upload = multer({ dest: 'public/img/' });

router.get('/', uploads);
router.post('/header', upload.single('user_header'), headerUpload);
router.post('/painting', upload.single('painting'), paintingUpload);
router.post('/tradework', upload.single('tradework'), tradeworkUpload);


function uploads(req, res, next) {
    res.render('upload', { title: 'pm2.5 cloud platform' })
}


function headerUpload(req, res, next) {
    var userID = req.session.userID;
    var status = 0;
    var message = '';
    if (userID)
    {
        fs.rename(__dirname + '/../../public/img/' + req.file.filename,__dirname + '/../../public/img/header/'+userID.toString()+'.png',function(err){
            if(err){
                status = 0;
                message = 'Failed to upload profile image';
            }
            else {
                status = 1;
                message = 'Successfully uploaded profile image';
            }
            res.json({
               status: status,
                msg: message
            });
            console.log('header transfer done!');
            return;
        });
    }
    else{
        //handle error
        res.redirect('/login');
    }
}

function paintingUpload(req, res, next) {
    var userID = req.session.userID;
    var title = req.body.title;
    if (userID)
    {
        pool.getConnection(function(err, connection) {
            if (err) {
                // handle error
                //delete file
                fs.unlink(__dirname + '/../../public/img/' + req.file.filename);
                res.json({
                    status : 0,
                    msg: 'Failed to connect to database'
                });
                return;
            }
            var datetime = new Date();
            console.log(datetime);
            connection.query(
                sql.addContribute,
                [title, userID, path.extname(req.file.originalname)],
                function (err, result) {
                    var state = 0;
                    var message = '';
                    if (err) {
                        //handle error
                        state = 0;
                        message = err.code + ' ' + err.sqlMessage;
                        //delete file
                        fs.unlink(__dirname + '/../../public/img/' + req.file.filename);
                        res.json({
                            status: state,
                            msg: message
                        });
                        connection.release();
                        return;
                    }
                    var paintingID = 0;
                    if (result) {
                        paintingID = result[1][0].paintingID;
                        //res.render('following', {})
                        var sizeOf = require('image-size');
                        var height, width;
                        sizeOf(__dirname + '/../../public/img/' + req.file.filename, function (err, dimensions) {

                            height = dimensions.height;
                            width = dimensions.width;
                            fs.rename(__dirname + '/../../public/img/' + req.file.filename, __dirname + '/../../public/img/painting/' + paintingID.toString() + path.extname(req.file.originalname), function (err) {
                                if (err) {
                                    state = 0;
                                    message = 'Failed to rename the painting';
                                    res.json({
                                        status: state,
                                        msg: message
                                    });
                                    connection.release();
                                    return;
                                }
                                else
                                {
                                    connection.query(
                                        sql.modifyResolution,
                                        [height, width, userID, paintingID],
                                        function (err, result) {
                                            connection.release();
                                            state = 1;
                                            if (err)
                                            {
                                                message = 'Unknown resolution';
                                            }
                                            if (result)
                                            {
                                                message = 'Successfully uploaded a painting';
                                                res.json({
                                                    status: state,
                                                    msg: message
                                                });
                                            }
                                            return;
                                        }
                                    );
                                }
                            });
                        });

                    }
                });
        });
    }
    else{
        //handle error
        res.redirect('/login');
    }
}

function tradeworkUpload(req, res, next) {    
    var userID = req.session.userID;
    var tradeID = req.body.tradeID;
    if (userID)
    {
        pool.getConnection(function(err, connection) {
            if (err) {
                // handle error
                //delete file
                fs.unlink(__dirname + '/../../public/img/' + req.file.filename);
                res.json({
                    status : 0,
                    msg: 'Failed to connect to database'
                });
                return;
            }
            connection.query(
                sql.addTradeWork,
                [userID, tradeID, path.extname(req.file.originalname)],
                function (err, result) {
                    connection.release();
                    var state = 0;
                    var message = '';
                    if (err) {
                        //handle error
                        state = 0;
                        message = err.code + ' ' + err.sqlMessage;
                        //delete file
                        fs.unlink(__dirname + '/../../public/img/' + req.file.filename);
                        res.json({
                            status: state,
                            msg: message
                        });
                        return;
                    }
                    var paintingID = 0;
                    if (result) {
                        fs.rename(__dirname + '/../../public/img/' + req.file.filename, __dirname + '/../../public/img/tradework/' + tradeID.toString() + path.extname(req.file.originalname), function (err) {
                            if (err)
                            {
                                state = 0;
                                message = 'Failed to rename the painting';
                            }
                            else {
                                state = 1;
                                message = 'Successfully uploaded a painting';
                            }
                            res.json({
                                status: state,
                                msg: message
                            });
                            return;
                        });
                    }
                });
        });
    }
    else{
        //handle error
    }
}

module.exports = router;