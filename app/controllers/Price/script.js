/**
 * 株価の情報を取得する
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
var mongo = { db: 'stock_bk', collection: 'stocks' };
var searchUrl = 'http://info.finance.yahoo.co.jp/history/',// 検索を実行するサイト => yahooファイナンス
    key = { exchng: '東証2部', price:{$exists: false} },
    counter = 0,
    rFormat = {json: false, csv: false, mongo: true};

/* 引数で受け取る変数 */
var dayFm;// 何日まえから
var dayTo;// 何日までの株価を取得するか


/* =======================================================================
Uniqe code
========================================================================== */

// 起動チェック
function StartCheck () {
    
    // 引数チェック
    if (process.argv.length < 4) {
        console.log('missing argument.');
        process.kill(process.pid);
    } else {
        // 引数の受け取り
        dayFm = process.argv[2].split("-");
        dayTo = process.argv[3].split("-");
    }
}


ev.on('stocks', function() {

    // monogodbのデータを全容取得
    mg.findBy(mongo.db, mongo.collection, key, function(data) {
        var _count = 0;// カウンター

        // 一定期間待機させる
        var _tID = setInterval(function() {
            var _code = data[_count].code;
            var _c_name = data[_count].c_name;
            console.log('銘柄 => ' + _code);
            results[_c_name] =[];

            // 株価情報の取得
            ev.emit('search', searchUrl, _c_name, { 
                code: _code, 
                sy: dayFm[0], sm: dayFm[1], sd: dayFm[2], 
                ey: dayTo[0], em: dayTo[1], ed: dayTo[2] 
            });

            // twitterアカウントの数だけループ
            _count++;
            if (_count === data.length) { clearInterval(_tID); }

        }, 100*1000);
    });
});


// webサイトから情報
ev.on('search', function(u, c, q) {
    var _code = q.code;
    var _c_name = c;
    
    wm.getHtmlQuery(u, q, function($, res, body) {

        // 株価情報の取得
        $('table.boardFin tr').each(function(i) {
            if (i === 0) { return true; }// ヘッダ行は含めない
            var _info = $(this).html().replace(/<td>|,/g,"").split("</td>");
            results[_c_name].push({
                d   : new Date(_info[0].replace(/年|月|日/g,"/")),// 日付
                s_p : Number(_info[1]),// 始値
                h_p : Number(_info[2]),// 高値
                l_p : Number(_info[3]),// 安値
                e_p : Number(_info[4]),// 終値
                vl  : Number(_info[5]),// 出来高
                e_p_a : Number(_info[6]),// 調整後終値
            });
        });

        // 次ページへ遷移
        setTimeout(function() {

            // 次ページが存在するかチェック
            var _url = '';
            $('ul.ymuiPagingBottom a').each(function(i) {

                // 次ページが存在したら
                if ($(this).text() == '次へ') {
                    _url = $(this).url();
                    var _p = _url.slice(_url.indexOf('&p=')+3);// ページ数
                    console.log('Now page is ' + _p)
                    ev.emit('search', searchUrl, _c_name, { 
                        code: _code, 
                        sy: dayFm[0], sm: dayFm[1], sd: dayFm[2], 
                        ey: dayTo[0], em: dayTo[1], ed: dayTo[2],
                        p: _p
                    });
                }
            });

            // 次ページが存在しなければ、dbへ登録
            if (_url === '') {
                console.log('udate => ' + _code);
                mg.update(mongo.db, mongo.collection, { code : q.code }, { price: results[_c_name] });
            }

        }, 2*1000);
    });
});


// プロセスが終了する間際に呼ばれる
process.on('beforeExit', function () {

    // // json形式で出力
    // if (rFormat.json === true) {
    //     ut.writeFile(__dirname+'/json/results_'+ut.date()+'.json' ,JSON.stringify(results, null, 4));
    //     console.dir(results);
    // }

    // // csv形式で出力
    // if (rFormat.csv === true) {
    //     ut.writeFile(__dirname+'/csv/results_'+ut.date()+'.csv' ,
    //     ut.jsonToCsv(results, ['s_name', 'url', 'prof']));
    // }

    // // mongodbへ出力
    if (rFormat.mongo === true && results.length !== 0) {
        // mg.insert(mongo.db, mongo.collection, results);
        console.dir(results);
    }

    // 少し待ってからプロセスを終了する
	setTimeout(function() {
		process.exit();
	}, 500);
});


// 起動確認
StartCheck();

ev.emit('stocks');

