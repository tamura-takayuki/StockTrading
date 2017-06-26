/**
 * 銘柄コードの取得
 *
 * ＜設定方法＞
 * ①words変数に検索文字列を設定
 * ②resultFormat変数で結果の取得形式を指定
 */
 
/* ファイルの読み込み */
var mrl = require('url');
var ph = require('path');
var ut = require(__dirname+'/../js/util.js');// 便利関数
var mg = require(__dirname+'/../js/mongo-util.js');// 便利関数
var tw = require(__dirname+'/../js/twitter-util.js');// 便利関数
var wm = require(__dirname+'/../js/web-mining.js');// ウェブマインにングの関数とか設定とか
var st = require(__dirname+'/../Simulate/setting-stock.js');// グローバル変数が定義された、設定用のファイル

/* 変数定義 */
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter;// Create EventEmitter
var results = [];// 検索結果を格納する配列
var csvRow = '';

/* 設定 */
var mongo = { db: 'stock', collection: 'stocks' };
var searchUrl = 'http://www.kabutore.biz/ranking/kairiritsu.html',// 検索を実行するサイト => yahooファイナンス
    filter = { exchng : '東証2部', devision_rate : - 5, pbr : 0.9, min_price : 200000 },// 株のフィルター
    rFormat = {json: false, csv: false, mongo: false};



/* =======================================================================
Uniqe code
========================================================================== */

// 条件の読み込み
ev.on('init', function(u) {

    /* csvの読み込み */
    var _buyCases = [];
    ut.readFile(outputFile, function(data) {
        csvRow = data.split('\n');

        // 条件にマッチする株を検索
        ev.emit('search');
    });
});


// 条件にマッチする株を検索
ev.on('search', function() {
    var i = 0;
    var _tID = setInterval(function() {
        var _case = csvRow[i].split(',');

        // 最新の株価を取得
        // mg.findByOption(mongo.db, 'price_' + _case[0] ,{} , {'sort': {"d":-1}, limit:1}, function(data) {
        mg.findBy(mongo.db, 'price_' + _case[0] ,{ 'd' : new Date("2017-03-14T15:00:00Z") }, function(data) {
            // 上場廃止等の理由により、株価の情報取得に失敗した場合
            if (!data[0]) {return;}
            // 条件にマッチしたら
            if (data[0][_case[1]] <= parseFloat(_case[2])) {
                console.log("銘柄　=> " + _case[0]);
                console.dir(_case)
            }
        });

        i++;
        if (i == csvRow.length - 1) { clearInterval(_tID); }
    }, 50);
});


// プロセスが終了する間際に呼ばれる
process.on('beforeExit', function () {

    // 少し待ってからプロセスを終了する
	setTimeout(function() {
		process.exit();
	}, 500);
});


// 条件の読み込み
ev.emit('init', searchUrl);

