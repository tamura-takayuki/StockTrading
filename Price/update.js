/**
 * 株価の情報を更新する
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

/* 設定 */
var mongo = { db: 'stock', collection: 'stocks' };
var searchUrl = 'http://info.finance.yahoo.co.jp/history/',// 検索を実行するサイト => yahooファイナンス
    key = { target_flg : true },
    counter = 0;
var dayFm = [];// 何日まえから
var dayTo = [];// 何日までの株価を取得するか


/* =======================================================================
Uniqe code
========================================================================== */

// 対象の銘柄すべてを取得
ev.on('stocks', function() {

    mg.findBy(mongo.db, mongo.collection, key, function(data) {
        var _count = 0;// カウンター

        // 一定期間待機させる
        var _tID = setInterval(function() {
            var _code = data[_count].code;
            var _c_name = data[_count].c_name;
            console.log('銘柄 => ' + _code);
            results[_c_name] =[];

            // 取得する期間を決める
            ev.emit('setTerm', _code, _c_name);

            // twitterアカウントの数だけループ
            _count++;
            if (_count === data.length) { clearInterval(_tID); }

        }, 3*1000);
    });
});


// 開始日を決める
ev.on('setTerm', function(code, c_name) {
    
    // 最新の株価を取得
    mg.findByOption(mongo.db, 'price_' + code ,{} , {'sort': {"d":-1}, limit:1}, function(data) {
        var _dayFm;
        var _dayTo;

        // 開始日を決める
        if (data.length !== 0) {
            dayFm.length = 0;// 初期化
            _dayFm= new Date(data[0].d);
            // console.log((data[0].d));
        }　else {
            dayFm.length = 0;// 初期化
            _dayFm = new Date('2016/1/1')
        }
        dayFm.push(_dayFm.getFullYear());
        dayFm.push(_dayFm.getMonth()+1);
        dayFm.push(_dayFm.getDate() + 1);

        // 終了日を決める
        dayTo.length = 0;// 初期化
        _dayTo = new Date();
        dayTo.push(_dayTo.getFullYear());
        dayTo.push(_dayTo.getMonth()+1);
        dayTo.push(_dayTo.getDate());

        // // 株価情報の取得
        if (_dayTo.getTime() >= _dayFm.getTime()) {
            ev.emit('search', searchUrl, c_name, { 
                code: code, 
                sy: dayFm[0], sm: dayFm[1], sd: dayFm[2], 
                ey: dayTo[0], em: dayTo[1], ed: dayTo[2] 
            });
        }
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
            if (_url === '' && results[_c_name].length !== 0) {
                console.log('insert => ' + _code);
                results[_c_name].reverse();
                mg.insert(mongo.db, "price_" + _code, results[_c_name]);
                console.dir(results[_c_name]);
            }

        }, 1*1000);
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

