/**
 * チェック対象の銘柄をマーキング
 */
 
/* ファイルの読み込み */
var mrl = require('url');
var ph = require('path');
var ut = require(__dirname+'/../js/util.js');// 便利関数
var mg = require(__dirname+'/../js/mongo-util.js');// 便利関数
var tw = require(__dirname+'/../js/twitter-util.js');// 便利関数
var wm = require(__dirname+'/../js/web-mining.js');// ウェブマインにングの関数とか設定とか

/* 変数定義 */
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter;// Create EventEmitter
var results = [];// 検索結果を格納する配列
// var tweetTxt;// ツィートする文字列


/* 設定 */
var mongo = { db: 'stock', collection: 'stocks' };
var key = { 
    "detail.pbr" : { $lte : 1.3 },
    "detail.min_price" : { $lte: 200000 },
    $or : [ { exchng : '東証1部' }, { exchng : '東証2部' } ]
}
var buyPrice = 200000;
var min_stock = 500;

/* =======================================================================
Uniqe code
========================================================================== */

// 銘柄一覧の取得
ev.on('stocks', function() {

    // monogodbのデータを全容取得
    mg.findBy(mongo.db, mongo.collection, key, function(data) {

        console.log(data)

        // "min_stock"株数だけ、株を買えるかチェックする
        for (var i = 0; i < data.length; i++) {
            if (buyPrice / data[i].detail.s_price >= min_stock) { results.push(data[i]); console.log(data[i].detail.s_price) }
            else { continue; }
        }

        // "target_flg"をONにする
        var _count = 0;
        var _tID = setInterval(function() {
            console.log('銘柄 => ' + results[_count].code);

            // mongodbの更新
            mg.update(mongo.db, mongo.collection, { code : results[_count].code }, { "target_flg" : true });

            // resultsの数だけループ
            _count++;
            if (_count === results.length) { clearInterval(_tID); }

        }, 1*100);
    });
});


// プロセスが終了する間際に呼ばれる
process.on('beforeExit', function () {

    // 少し待ってからプロセスを終了する
	setTimeout(function() {
		process.exit();
	}, 500);
});

ev.emit('stocks');

