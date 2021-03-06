var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = require('../../dbconf/pool.js');
var sql = require('../../dbconf/sqlMapping.js');
var multer = require('multer');
var upload = multer({ dest: 'public/img/' });

// 招标的主页
// 感觉画家接单也可以直接放在这个页面
router.get('/', trade);
// 招标的发起页
router.patch('/newTrade',initialTradePatch);
router.get('/newTrade',initialTradeGet);
router.get('/oldTrade',getTrade);
router.patch('/oldTrade/selection',selectPainter);
router.patch('/oldTrade/application',applyForTrade);
router.delete('/oldTrade',cancelTrade);
router.patch('/complete',completeTrade);
router.get('/tradehomepage', tradeHomepage);
router.get('/oldTrade/uploadwork', uploadwork);



function trade(req, res, next) {
    var userID = req.session.userID;
    if (userID) {
        pool.getConnection(function (err, connection) {
            if (err) {
                // handle error
                res.render('error');
                connection.release();
                return;
            }
            connection.query(
                sql.getUserName +
                sql.getUserHeader +
                sql.getBuyerFlag +
                sql.getAllBriefTrade
                ,
                [userID, userID, userID]
                , function (err, result) {
                    if (err) {
                        // handle error
                        res.render('error');
                    }
                    if (result) {
                        res.render('trade', {
                            username : result[0][0].username,
                            user_header : result[1][0].user_header,
                            userID : userID,
                            buyerflag : result[2][0].buyerflag,
                            trade : result[3]
                        });
                    }
                    connection.release();
                }
            );
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function initialTradeGet(req, res, next) {
    var userID = req.session.userID;
    if (userID)
    {
        pool.getConnection(function (err, connection) {
            if (err) {
                // handle error
                res.render('error');
                return;
            }
            connection.query(
                sql.getUserName +
                sql.getUserHeader +
                sql.getBuyerFlag
                ,
                [userID, userID, userID]
                , function (err, result) {
                    connection.release();
                    if (err) {
                        // handle error
                        res.render('error');
                    }
                    if (result) {
                        res.render('initTrade', {
                            username : result[0][0].username,
                            user_header : result[1][0].user_header,
                            buyerflag : result[2][0].buyerflag,
                            userID : userID
                        });
                    }
                }
            );
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function initialTradePatch(req, res, next) {
    var userID = req.session.userID;
    var body = req.body;
    var status = 1;
    var message = '';
    var trade = req.body;
    if (userID)
    {
        pool.getConnection(function (err, connection) {
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
                sql.addTrade,
                [body.abstract, body.price, body.deadline, 'Calling', userID]
                , function (err, result) {
                    if (err) {
                        // handle error
                        status = 0;
                        message = err.code + ' ' + err.sqlMessage;
                        res.json({status:status, msg:message});
                        connection.release();
                        return;
                    }
                    if (result) {
                        var trade_id = Number(result[1][0].tradeID);
                        var tags = req.body.tag;
                        var trade_tag_pair = new Array(tags.length);
                        for (var i = 0; i < tags.length; i++)
                        {
                            trade_tag_pair[i] = [trade_id,tags[i]];
                        }
                        connection.query(
                            sql.addTradeTags,
                            [trade_tag_pair]
                            , function (err, result) {
                                connection.release();
                                if (err) {
                                    //handle error
                                    status = 0;
                                    message = 'Successfully added a trade，but failed to add a tag';
                                    res.json({status:status, msg:message});
                                    return;
                                }
                                if (result)
                                {
                                    status = 1;
                                    message = 'Successfully added a trade';
                                    res.json({status:status, msg:message});
                                    return;
                                }
                            }
                        );
                    }
                }
            );
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function getTrade(req, res, next) {
    var userID = req.session.userID;
    var tradeID = Number(req.query.tradeID);
    if (userID) {
        pool.getConnection(function (err, connection) {
            if (err) {
                // handle error
                res.render('error');
                return;
            }
            connection.query(
                sql.getFullTrade +
                sql.getApplier +
                sql.getUserType +
                sql.getTradeUrl,
                [tradeID, tradeID, userID, userID, tradeID]
                , function (err, result) {
                    if (err) {
                        // handle error
                        res.render('error');
                        connection.release();
                    }
                    if (result) {
                        var isApplied = false;
                        var isBuyer = false;
                        var isResponded = false;
                        var type;
                        var url;
                        //if (result[4][0] != null)
                        url = result[4][0].url;
                        var responderID = result[0][0].responder;
                        var buyerID = result[0][0].buyer;
                        if (result[2][0].type == 'o') type = 0;
                        else if(result[2][0].type == 'p') type = 1;
                        else if (result[2][0].type == 'b') type = 2;
                        for (var i = 0; i < result[1].length; i++) {

                            if (userID == result[1][i].userID) {
                                isApplied = true;
                            }
                        }
                        if (result[0][0].responder == userID)
                        {
                            isResponded = true;
                        }
                        if (result[0][0].buyer == userID)
                        {
                            isBuyer = true;
                        }
                        //result[1].user_header = 'public/img/header/'+String(result[1].userID)+'.png';
                        sendJSON = {
                            trade: result[0][0],
                            applier: result[1],
                            isApplied: isApplied,
                            isResponded: isResponded,
                            isBuyer: isBuyer,
                            type: type,
                            url: url
                        };
                        connection.query(
                            sql.getUserName +
                            sql.getUserName,
                            [responderID, buyerID]
                            , function (err, result) {
                                if (result) {
                                    connection.release();
                                    if (result[0][0])
                                        sendJSON.respondername = result[0][0].username;
                                    else sendJSON.respondername = null;
                                    if (result[1][0])
                                        sendJSON.buyername = result[1][0].username;
                                    else sendJSON.buyername = null;
                                    res.render('getTrade', sendJSON);
                                }
                            }
                        );
                    }
                });
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function selectPainter(req, res, next) {
    var userID = req.session.userID;
    var status = 1;
    var message = '';
    var tradeID = req.body.tradeID;
    var painterID = Number(req.body.selectedID);
    if (userID) {
        pool.getConnection(function (err, connection) {
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
                    sql.addResponderForTrade,
                [tradeID, painterID,userID]
                , function (err, result) {
                    connection.release();
                    if (err) {
                        // handle error
                        status = 0;
                        message = err.code + ' ' + err.sqlMessage;
                    }
                    if (result) {
                        status = 1;
                        message = 'Successfully chose a painter';
                    }
                    res.json({
                        status : status,
                        msg : message
                    });
                    return;
                });
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function applyForTrade(req, res, next) {
    var userID = req.session.userID;
    var status = 1;
    var message = '';
    var tradeID = Number(req.body.tradeID);
    console.log(userID);
    console.log(tradeID);
    if (userID) {
        pool.getConnection(function (err, connection) {
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
                sql.addApplierForTrade,
                [userID, tradeID]
                , function (err, result) {
                    connection.release();
                    if (err) {
                        // handle error                        
                        status = 0;
                        message = err.code + ' ' + err.sqlMessage;
                    }
                    if (result) {
                        status = 1;
                        message = 'Successfully applied for a trade';
                    }
                    res.json({
                        status : status,
                        msg : message
                    });
                    return;
                });
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function tradeHomepage(req, res, next) {
    var userID = req.session.userID;
    var status = 1;
    var message = '';
    var getID = req.query.userID;
    if (!getID) getID = userID;
    if (userID) {
        console.log(userID);
        pool.getConnection(function (err, connection) {
            if (err) {
                // handle error
                res.render('error');
                return;
            }
            connection.query(
                sql.getUserName +
                sql.getUserHeader +
                sql.getRelatedTrades,
                [getID,getID,getID]
                , function (err, result) {
                    connection.release();
                    if (err) {
                        // handle error
                        res.render('error');
                    }
                    if (result) {
                        console.log(result);
                        //if (result[1][0] == null)
                          //  result[1] = [];
                        console.log(result.length >= 4?result[3]:[]);
                        res.render('tradeHomepage',{                            
                            trade:result.length >= 4?result[3]:[],
                            username: result[0][0].username,
                            user_header:result[1][0].user_header,
                            userID: getID
                        });
                    }
                    return;
                });
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function cancelTrade(req, res, next) {
    var userID = req.session.userID;
    var status = 1;
    var message = '';
    var tradeID = req.query.tradeID;
    if (userID) {
        pool.getConnection(function (err, connection) {
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
                sql.cancelTrade,
                [userID, tradeID]
                , function (err, result) {
                    connection.release();
                    if (err) {
                        // handle error
                        status = 0;
                        message = err.code + ' ' + err.sqlMessage;
                    }
                    if (result) {
                        status = 1;
                        message = 'Successfully canceled a trade';
                    }
                    res.json({
                        status : status,
                        msg : message
                    });
                    return;
                });
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function completeTrade(req, res, next) {
    var userID = req.session.userID;
    var status = 1;
    var message = '';
    var tradeID = req.body.tradeID;

    if (userID) {
        pool.getConnection(function (err, connection) {
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
                sql.completeTrade,
                [userID, tradeID]
                , function (err, result) {
                    connection.release();
                    if (err) {
                        // handle error
                        status = 0;
                        message = err.code + ' ' + err.sqlMessage;
                    }
                    if (result) {
                        status = 1;
                        message = 'Successfully finished a trade';
                    }
                    res.json({
                        status : status,
                        msg : message
                    });
                    return;
                });
        });
    }
    else
    {
        //handle error
        res.redirect('/login');
    }
}

function uploadwork(req, res, next) {
    var userID = req.session.userID;
    var tradeID = req.query.tradeID;
    if (userID) {
        pool.getConnection(function (err, connection) {
            if (err) {
                // handle error
                res.render('error');
                return;
            }
            connection.query(
                sql.getUserName +
                sql.getUserHeader,
                [userID, userID]
                , function (err, result) {
                    connection.release();
                    if (err) {
                        // handle error
                        res.render('error');
                    }
                    if (result) {
                        res.render('uploadwork',
                            {
                                username: result[0][0].username,
                                user_header: result[1][0].user_header,
                                userID: req.query.userID,
                                tradeID: tradeID
                            });
                    }
                }
            );
        });
    }
    else
    {
        res.redirect('/login');
    }
}

module.exports = router;