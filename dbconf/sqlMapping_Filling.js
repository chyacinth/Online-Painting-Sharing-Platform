/*
 本次修改的语句：
 [添加]
 [删除]
 [修改]
 getRelatedTrades
 addApplierForTrade
 getApplier
 */
/*
 本次对数据库的修改：
 [添加]
 */

var user = {
    addUser : 'CALL addUser(?,?,?,?,@output);SELECT @output AS userID;',//return userID 第一个参数是用户名，第二个参数是用户类型，第三个参数是密码，第四个参数是alipay_address
    checkUserPassword : 'SELECT checkUserPassword(?,?) AS userID;', //第一个参数是用户名,第二个参数是用户提供的密码，返回是否登陆成功，成功返回userID，失败返回-1，返回值名为userID [已修改]
    getUserName : 'SELECT username FROM user WHERE id = ?;',//返回username，输入用户ID
    getPaintingName : 'SELECT topic FROM painting WHERE id = ?;',
    getContribute : 'SELECT p.url AS url, c.painting AS paintingID, p.topic AS name FROM painting p, contribute c WHERE c.user = ? and c.painting = p.id;',//输入用户ID
    getContributeNum : 'SELECT count(*) AS contribute_num FROM contribute WHERE user = ?;',
    getFollowing : 'SELECT followee AS userID, icon AS header ,username FROM follow, user WHERE followee = id and follower = ?;',//已修改，返回当前用户关注的人
    getFollowingNum : 'SELECT count(*) AS following_num FROM follow WHERE follower = ?;',//已修改，返回当前用户关注的人数
    getCollectedPainting : 'SELECT p.url AS url, c.painting AS paintingID ,p.topic AS name FROM painting p, collection c WHERE c.user = ? and c.painting = p.id;',
    getCollectedNum : 'SELECT count(*) AS collect_num FROM collection WHERE user = ?;',
    getMostTag :'SELECT count(c.painting) as count, pt.tag as tag FROM contribute c,painting p, painting_tag pt WHERE c.user = ? and c.painting = p.id and p.id = pt.painting GROUP BY tag ORDER BY count DESC;',
    getUserHeader : 'SELECT icon AS user_header FROM user WHERE id = ?;',
    getUserAlipay : 'SELECT alipay_address AS alipay FROM user WHERE id = ?;',
    addFollowing : 'INSERT INTO follow(follower, followee) VALUES (?,?);',
    delFollowing : 'DELETE FROM follow WHERE follower = ? and followee = ?;',
    addCollecting : 'INSERT INTO collection(user, painting) VALUES(?,?);',
    delCollecting : 'DELETE FROM collection WHERE user = ? and painting = ?;',
    addContribute : 'CALL addContribute(?,?,?,@output); SELECT @output AS paintingID;',//第一个参数是主题，第二个参数是画师ID，第三个参数是format。注意:appContribute的时候 要把(userID, paintingID)加到 contribute表中，并返回新加入的paintingID，返回值名为paintingID
    delContribute : 'SELECT delContribute(?,?) AS paintingurl;', //第一个参数是paintingID,第二个参数是userID,该函数会级联删除所有与当前画作有关的信息。注意：delContribute返回值为删除画的url，变量名为paintingurl
    modifyUserName : 'UPDATE user SET username = ? WHERE id = ?;',
    addView: 'UPDATE painting SET page_view = page_view + 1 WHERE id = ?;',
    getUserNameByPaintingID : 'SELECT username FROM user u,contribute c WHERE u.id = c.user and c.painting = ?;',
    getUserHeaderByPaintingID : 'SELECT icon AS user_header FROM user u,contribute c WHERE u.id = c.user and c.painting = ?;',
    getUserIDByPaintingID : 'SELECT id AS userID FROM user u,contribute c WHERE u.id = c.user and c.painting = ?;',
    getUrl : 'SELECT url FROM painting WHERE id = ?;',//输入是paintingID,输出是painting的URL
    getTagByPaintingID : 'SELECT tag FROM painting_tag WHERE painting = ?;',
    getCreatedTime : 'SELECT upload_time AS time FROM painting WHERE id = ?;',
    getResolution : 'SELECT length, width FROM painting WHERE id = ?;',
    modifyResolution: 'CALL modifyResolution(?,?,?,?);',//输入参数 长 宽 userID paintingID
    getRatedCount : 'SELECT upvote AS ratedCount FROM painting WHERE id = ?;',
    getViewCount : 'SELECT page_view AS viewCount FROM painting WHERE id = ?;',
    delPaintingTag : 'SELECT delPaintingTag(?,?,?) AS status;',//这个函数的第一个参数是paintingID,第二个参数是paintingTag,第三个参数是操作用户的id，只有画师可以删Tag @陈旭旸
    addPaintingTag : 'INSERT INTO painting_tag VALUES(?,?);',//已修改 第一个变量是paintingID，第二个变量是tag
    getBuyerFlag :'SELECT getBuyerFlag(?) AS buyerflag;',//返回0代表不是买家，返回1代表是买家
    getBriefTrade :'SELECT t.buyer AS buyer, t.price AS price, t.deadline AS ddl, t.status AS state, u.username AS buyername,t.id AS tradeID FROM trade t,user u WHERE t.buyer = u.id and u.id = ?;',
    getAllBriefTrade :'SELECT t.buyer AS buyer, t.price AS price, t.deadline AS ddl, t.status AS state, u.username AS buyername,t.id AS tradeID FROM trade t,user u WHERE t.buyer = u.id;',
    addTrade :'CALL addTrade(?,?,?,?,?,@output); SELECT @output AS tradeID;',//目前的使用范例为 CALL addTrade('test_for_contri',20,'2017-08-08 22:22','start',1,@output); SELECT @output AS tradeID;
    addTradeTags : 'INSERT INTO trade_tag VALUES ?;',//第一个值是tradeID,第二个值是tag
    getFullTrade : 'SELECT * FROM trade WHERE id = ?;',//我看过所有的参数都对的上，要是需要改动请注明 @陈旭旸
    getApplier : 'SELECT painter AS userID,username AS username,icon AS user_header FROM painter_apply_for_trade, user WHERE trade = ? AND id = painter;', 
    addResponderForTrade :'CALL buyer_decide_painter(?,?,?);',//第一个参数是tradeID，第二个参数是painterID，第三个参数是buyerID
    addApplierForTrade : 'CALL painter_apply_for_trade(?,?)',//第一个参数是painterID,第二个参数是tradeID
    getRelatedTrades : 'SET @inuserid = ?; CALL getRelatedTrades(@buyer,@price,@state,@buyername,@relation,@ddl,@tradeID); SELECT @buyer AS buyer,@price AS price,@buyername AS buyername,@state AS state,@ddl AS ddl,@tradeID AS tradeID;',//参数是第一个输入，userID，第二个到第七个是输出，buyer,price,buyername,state,relation,tradeID
    getUserType : 'SELECT type FROM user WHERE id = ?;',
    update:'update user set name=?, age=? where id=?;',
    upvote:'INSERT INTO upvote VALUES (?,?); UPDATE painting SET upvote = upvote + 1 WHERE id = ?;',//userID paintingID
    delete: 'delete from user where id=?;',
    queryById: 'select * from user where id=?;',
    queryAll: 'select * from user;',
    cancelTrade :'CALL cancelTrade(?,?);',//userID tradeID
    searchUserByName :'SELECT * FROM user WHERE username like ?;',
    modifyUserPassword :'SELECT modifyUserPassword(?,?,?);',//第一个参数是oldUserPassword，第二个参数是newUserPassword，第三个参数是userID
    modifyUserBasicInfo :'UPDATE user SET username = ?, alipay_address = ? WHERE id = ?;',
    chargeMoney :'CALL buyer_add_money(?,?)',//第一个参数是userID,第二个参数是money
    addTradeWork :'CALL addTradeWork(?,?,?)',//第一个参数是painterID,第二个参数是tradeID,第三个参数是paintingURL格式 就是trade中的upload_file_route
    getTradeUrl :'CALL getTradeUrl(?,?,@url); SELECT @url AS url;',//第一个参数是buyerID,第二个参数是tradeID,第三个参数是paintingURL 就是trade中的upload_file_route
    getUserInfo: 'SELECT phomepage, twitter, abstract FROM user WHERE id = ?',
    getUserMoney :'CALL getUserMoney(?,@frozen_money,@current_money);SELECT @frozen_money AS frozen_money,@current_money AS current_money;',//第一个参数是userID,第二个是frozenMoney,第三个参数是currentMoney
    modifyUserTwitter :'UPDATE user SET twitter = ? WHERE id = ?',
    modifyUserAbstract : 'UPDATE user SET abstract = ? WHERE id = ?',
    modifyUserHomepage : 'UPDATE user SET phomepage = ? WHERE id = ?'
};

module.exports = user;