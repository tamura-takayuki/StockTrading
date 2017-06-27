/**
 * 株情報をyahooファイナンスより最新情報にアップデートする
 *
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
var searchUrl = 'http://stocks.finance.yahoo.co.jp/stocks/',// 検索を実行するサイト => はてなブ
    key = { $or : [ { exchng : '東証1部' }, { exchng : '東証2部' } ] }
    rFormat = {json: false, csv: false, mongo: false};


/* =======================================================================
Uniqe code
========================================================================== */

ev.on('stocks', function() {

    // monogodbのデータを全容取得
    mg.findBy(mongo.db, mongo.collection, key, function(data) {
        var _count = 0;// カウンター

        // 一定期間待機させる
        var _tID = setInterval(function() {
            console.log('銘柄 => ' + data[_count].code);

            // 詳細情報の更新
            ev.emit('update-detail', data[_count].code);

            // twitterアカウントの数だけループ
            _count++;
            if (_count === data.length) { clearInterval(_tID); }

        }, 1*1000);
    });
});


// 詳細情報の更新
ev.on('update-detail', function(code) {

    wm.getHtmlQuery(searchUrl + 'detail/', { code : code }, function($, res, body) {

        // 業界
        var _industry = $(".category.yjSb").text();
        
        // 株価の取得
        var _s_price = $(".stoksPrice").text().replace(/\n/g, "").replace(/,/g, "").trim();

        // 参考指標の取得
        var _info = [];
        $('#rfindex .ymuiEditLink.mar0 strong').each(function(i) {
            _info.push($(this).text());
        });

        var _detalil = {
            industry : _industry, // 業界
            s_price : Number(_s_price), // 株価
            dividend_yield : Number(_info[2]), // 配当利回り
            per : Number(_info[4].replace(/\(連\)/g, "").replace(/\(単\)/g, "").replace(/,/g, "").trim()), // PER
            pbr : Number(_info[5].replace(/\(連\)/g, "").replace(/\(単\)/g, "").replace(/,/g, "").trim()), // PBR
            eps : Number(_info[6].replace(/\(連\)/g, "").replace(/\(単\)/g, "").replace(/,/g, "").trim()), // EPS
            bps : Number(_info[7].replace(/\(連\)/g, "").replace(/\(単\)/g, "").replace(/,/g, "").trim()), // BPS
            min_price : Number(_info[8].replace(/,/g, "")), // 最低購入代金
            units : Number(_info[9].replace(/,/g, "")), // 単元株数
        }
        
        // mongodbの更新
        mg.update(mongo.db, mongo.collection, { code : code }, { detail: _detalil });

    });
});


// プロセスが終了する間際に呼ばれる
process.on('beforeExit', function () {

    // json形式で出力
    if (rFormat.json === true) {
        ut.writeFile(__dirname+'/json/results_'+ut.date()+'.json' ,JSON.stringify(results, null, 4));
        console.dir(results);
    }

    // csv形式で出力
    if (rFormat.csv === true) {
        ut.writeFile(__dirname+'/csv/results_'+ut.date()+'.csv' ,
        ut.jsonToCsv(results, ['s_name', 'url', 'prof']));
    }

    // mongodbへ出力
    if (rFormat.mongo === true && results.length !== 0) {
        mg.insert(mongo.db, mongo.collection, results);
        // console.dir(results);
    }

    // 少し待ってからプロセスを終了する
	setTimeout(function() {
		process.exit();
	}, 500);
});


ev.emit('stocks');

