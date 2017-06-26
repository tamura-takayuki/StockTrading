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

/* 変数定義 */
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter;// Create EventEmitter
var results = [];// 検索結果を格納する配列
// var tweetTxt;// ツィートする文字列


/* 設定 */
var mongo = { db: 'stock', collection: 'stocks' };
var searchUrl = 'http://stocks.finance.yahoo.co.jp/stocks/qi/',// 検索を実行するサイト => yahooファイナンス
    counter = 0;
    rFormat = {json: false, csv: false, mongo: false};

// 五十音銘柄一覧（五十音順に銘柄を取得する）
js = [
    'あ','い','う','え','お',
    'か','き','く','け','こ',
    'さ','し','す','せ','そ',
    'た','ち','つ','て','と',
    'な','に','ね','の',
    'は','ひ','ふ','へ','ほ',
    'ま','み','む','め','も',
    'や','ゆ','よ',
    'ら','り','る','れ','ろ',
    'わ',
]


/* =======================================================================
Uniqe code
========================================================================== */


// dbに株情報を登録
function registerResults(callback) {

    // monogodbのデータを全容取得
    mg.findAll(mongo.db, mongo.collection, function(data) {

        // 更新
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < results.length; j++) {
                if (data[i].code == results[j].code) {
                    console.log('update => ' + results[j].code);
                    mg.update(mongo.db, mongo.collection, { code: results[j].code}, results[j]);
                    results.splice(j, 1);
                    break;    
                }
            }
        }

        // 新規登録
        if (results.length !==0) {
            console.dir(results);
            mg.insert(mongo.db, mongo.collection, results);
        }

        // データが登録されるまで3秒後待つ
        setTimeout(callback, 3*1000);
    });
}

// webサイトから情報
ev.on('search', function(u, q) {
    
    wm.getHtmlQuery(u, q, function($, res, body) {

        // 検索結果を取得
        $('table tr.yjM').each(function(i) {

            // 検索結果をjson形式に変換
            results.push({
                code   : $(this).find('.center.yjM').text(),// 銘柄番号
                exchng : $(this).find('.center.yjSt').text(),// 証券取引所
                c_name : $(this).find('.yjMt').text(),// 会社名
                prof   : $(this).find('.profile').text(),// プロジール
            });
        });

        // 次ページへ遷移
        setTimeout(function() {
            var _url = $('.listNext a').url();

            // 次ページが存在すれば、次ページへ遷移
            if (_url.length !== 0) {
                var _p = _url.slice(_url.indexOf('&p=')+3);// ページ数
                ev.emit('search', searchUrl, { js: js[counter], p: _p });
            } 

            // 次ページが存在しなければ、株価を登録して、次の検索ワードへ
            else {
                registerResults(function() {
                    results.length = 0;//resultsの初期化
                    counter++;
                    if (counter < js.length) { ev.emit('search', searchUrl, { js: js[counter] }); }
                });

            }
        }, 3*1000);
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
        console.dir(results);
    }

    // 少し待ってからプロセスを終了する
	setTimeout(function() {
		process.exit();
	}, 500);
});


// 最初のワードで検索を実行
ev.emit('search', searchUrl, { js: js[counter] });


