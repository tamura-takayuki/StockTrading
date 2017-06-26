/**
 * twitter util functions
 */
 
/* read modules */
var Twitter = require('twitter');

// twitter client
var client = new Twitter({　// <= g_i_consulting
    consumer_key: 'uedGm2k7ppYL40NJytdCEMVTA',
    consumer_secret: 'Y0hH4iArw5EqdLEE6VOIzSHasOGSfl7m9JYma9B3a9EoMFttx9',
    access_token_key: '715479896772857859-mhS2Wi509P5VACAA0EQHrIgPUahWZOn',
    access_token_secret: 'mIOX7FGEuRtqTZJcbgjbO01mdAH6nfKNyhuXyJNCFj9Sc'
});
// var client = new Twitter({ // <= durinssbane
//     consumer_key: '47Q5zthfMK902pOSAoyDFMPI1',
//     consumer_secret: 'jde8ujcbNvdI2VNowq9xrhXR178B3c2KwDnvgljTSCm39prZaO',
//     access_token_key: '405620505-ckqSWGTqXGVmFfGmCntfIfzoPibOwG0G3aM1tRjV',
//     access_token_secret: 'Af3IhzJsnNHUdDMrwS6XDnOcIlMZ2xHP0ob9f8YqixbXk'
// });

// 自作のエラー
var myerr = { key : "empty" };



/* =======================================================================
Functions
========================================================================== */

module.exports = {

    /**
     * tweetを取得
     * param sn => screen name, ct => 取得するtweet数, cb => callback
     */
    getTweets : function(sn, ct, cb) {

        var params = {screen_name: sn, count: ct};
        client.get('statuses/user_timeline', params, function(err, tweets, response){
            
            // 制限に引っかかったら
            if (err && err[0] && err[0].code && err[0].code === 88) {
                console.dir(err);

                // 再実行
                setTimeout(function() { 
                    console.log('setTimeout =>' + sn);
                    module.exports.getTweets(sn, ct, cb); 
                }, 60*5000);
            }

            // エラーならログを出力して終了
            else if (err) { return console.dir(err); }
            
            // tweetを取得できれば
            else { cb(tweets) };
        });
    },


    /**
     * tweetを取得できるか確認
     * param sn => screen name, cb => callback
     */
    canGetTweets : function(sn, cb) {
        
        var params = {screen_name: sn};
        client.get('statuses/user_timeline', params, function(err, tweets, response) {

            // 制限に引っかかったら
            if (err && err[0] && err[0].code && err[0].code === 88) {
                console.dir(err);

                // 再実行
                setTimeout(function() { 
                    console.log('setTimeout =>' + sn);
                    module.exports.canGetTweets(sn,cb); 
                }, 60*5000);
            }

            // 制限以外のエラーは拾わない
            else if (err) { cb({s_name: sn, can: false}); }

            // tweetを取得できれば
            else { cb({s_name: sn, can: true}); }
        });
    },

    /**
     * user情報を取得
     * param param => {user_id: 'some', screen_name: 'thing'}, cb => callback
     */
    getUserInfo : function(param, cb) {

        client.get('users/show', param, function(err, info, response){

            // 制限に引っかかったら
            if (err && err[0] && err[0].code && err[0].code === 88) {
                console.dir(err);

                // 再実行
                setTimeout(function() { 
                    console.log('setTimeout =>' + param.user_id);
                    module.exports.getUserInfo(param, cb); 
                }, 10*60*1000);
            }

            // 制限以外のエラーならログを出力して終了
            else if (err) { return console.dir(err); }

            // profを返却
            else { cb(info); }
        });
    },


    /**
     * profileを取得する
     * param sn => screen name, cb => callback
     */
    getProf : function(sn, cb) {

        var params = {screen_name: sn};
        client.get('users/show', params, function(err, data, response){

            // 制限に引っかかったら
            if (err && err[0] && err[0].code && err[0].code === 88) {
                console.dir(err);

                // 再実行
                setTimeout(function() { 
                    console.log('setTimeout =>' + sn);
                    module.exports.getProf(sn,cb); 
                }, 60*5000);
            }

            // 制限以外のエラーならログを出力して終了
            else if (err) { return console.dir(err); }

            // profを返却
            else { cb({ s_name: sn, prof: data.description }); }
        });
    },


    /**
     * followerのIDを取得
     * param sn => screen name, cb => callback
     */
    getFollowerID : function(sn, cb) {

        var params = { screen_name: sn };
        client.get('followers/ids', params, function(err, data, response){
            
            // 制限に引っかかったら
            if (err && err[0] && err[0].code && err[0].code === 88) {
                console.dir(err);

                // 再実行
                setTimeout(function() { 
                    console.log('setTimeout =>' + sn);
                    module.exports.getFollowerID(sn, cb); 
                }, 60*5000);
            }

            // エラーならログを出力して終了
            else if (err) { return console.dir(err); }
            
            // tweetを取得できれば
            else { cb(data.ids) };
        });
    },


    /**
     * tweetする
     * param txt => tweet内容, cb => callback
     */
    postTweets : function(txt, cb) {

        // ツィーツする文字列ななければreturn
        if (!txt) { return console.log('tweet txt is empty'); };

        client.post('statuses/update', {status : txt}, function(err, data, resp) {

            // 制限に引っかかったら
            if (err && err[0] && err[0].code && err[0].code === 88) {
                console.dir(err);

                // 再実行
                setTimeout(function() { 
                    console.log('setTimeout =>' + sn);
                    module.exports.postTweets(txt, cb); 
                }, 60*5000);
            }

            // エラーならログを出力して終了
            else if (err) { return console.dir(err); }

            // tweetを取得できれば
            else { cb(data) };
        });
    },


    /**
     * twitter apiの規制状況を取得する
     * param target => api規制を確認するターゲット, cb => callback
     */
    limitStatus : function(target, cb) {

        client.get('application/rate_limit_status', function(err, data){

            // エラーならログを出力して終了
            if (err) { return console.dir(err); }

            cb(data);
        });
    },

}

