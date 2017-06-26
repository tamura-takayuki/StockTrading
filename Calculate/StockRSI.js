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
// var results = [];// 検索結果を格納する配列

/* 設定 */
var mongo = { db: 'stock', collection: 'stocks' },
    key = { target_flg : true };


/* =======================================================================
Uniqe code
========================================================================== */

// RSIの計算
function calculateRSI(data, section, term, span) {
    var _plusAve = 0;
    var _minuAve = 0;
    var _rsi = 0;
    var _results = [];

    // 計算
    for (var i = 0; i < data.length; i++) {

        // すでに計算済みならスキップ
        if (typeof data[i]['rsi_' + section] !== 'undefined') { continue; }

        // 最初の値は問答無用でスキップ
        if (i == 0) {
            data[i]['rsi_' + section] = 0
            _results.push(data[i]);
            continue;
        }

        // 時間が計算対象でなければ直前の値を格納して、スキップ
        if (i % span != 0) {
            data[i]['rsi_' + section] = data[i-1]['rsi_' + section]
            _results.push(data[i]);
            continue;
        } 

        // 初期値以前なら
        if (i < term) {

            // 前日と比べて値上がりなら
            if (data[i].e_p_a >= data[i-1].e_p_a) {
                _plusAve += data[i].e_p_a;
            }

            // 前日と比べて値下がりなら
            else {
                _minuAve += data[i].e_p_a;   
            }

            // 初期値なら
            if (i == term - 1) {
                _plusAve = _plusAve / (term / span);
                _minuAve = _minuAve / (term / span);
                _rsi = _plusAve / (_plusAve + _minuAve);
                data[i]['rsi_' + section] = Math.round(_rsi*1000)/1000; // 小数点以下４桁を四捨五入
                _results.push(data[i]);
            }

            else {
                data[i]['rsi_' + section] = 0;
                _results.push(data[i]);
            }
        }

        // 初期値以降なら
        else {

            // 前日と比べて値上がりなら
            if (data[i].e_p_a >= data[i-1].e_p_a) {
                _plusAve = (_plusAve * (term / span - 1) + data[i].e_p_a) / (term / span);
                _minuAve = (_minuAve * (term / span - 1)) / (term / span);
            }

            // 前日と比べて値下がりなら
            else {
                _plusAve = (_plusAve * (term / span - 1)) / (term / span);
                _minuAve = (_minuAve * (term / span - 1) + data[i].e_p_a) / (term / span);
            }

            _rsi = _plusAve / (_plusAve + _minuAve);
            data[i]['rsi_' + section] = Math.round(_rsi*1000)/1000; // 小数点以下４桁を四捨五入
            _results.push(data[i]);
        }
    }

    // 結果を返却
    return _results;
}

// DBの更新
function updateDB(results, code) {

    // 1行づつ地味に更新する
    var i = 0;
    var iID = setInterval(function() {

        // 更新するデータ
        var _data = {
            'rsi_5d': results[i].rsi_5d,
            'rsi_20d': results[i].rsi_20d,
        }
        
        // DBの更新
        mg.update(mongo.db, 'price_' + code , { _id: results[i]._id }, _data, function(data) {
            console.dir(data);
        });
        
        i++;
        if (i == results.length) { clearInterval(iID); }// 最後のデータでループを抜ける
    }, 100); 
}

ev.on('stock', function() {

    // 対象銘柄をすべて取得
    mg.findBy(mongo.db, mongo.collection ,key , function(data) {
        var _count = 0;// カウンター

        // 一定期間待機させる
        var _tID = setInterval(function() {
            var _code = data[_count].code;
            console.log('銘柄 => ' + _code);

            // 最新の株価を取得
            mg.findByOption(mongo.db, 'price_' + _code ,{} , {'sort': {"d":1}}, function(price) {
                var _section = 0;
                var _span = 0;
                var _term = 0;

                /* RSIの計算 */
                _section = '5d';
                _span = 1;
                _term = _span * 5;
                var _r1 = calculateRSI(price, _section, _term, _span);

                /* RSIの計算 */
                _section = '20d';
                _span = 1;
                _term = _span * 20;
                var _r2 = calculateRSI(price, _section, _term, _span);

                /* 計算結果の統合 */
                var _results = Object.assign(_r1, _r2);

                /* DBの更新 */
                if (_results.length != 0) {
                    // console.dir(_results);
                    updateDB(_results, _code)
                }
            });

            // 数だけループ
            _count++;
            if (_count === data.length) { clearInterval(_tID); }

        }, 60*1000);
    });
});


// プロセスが終了する間際に呼ばれる
process.on('beforeExit', function () {

    // 少し待ってからプロセスを終了する
    setTimeout(function() {
        process.exit();
    }, 500);
});


ev.emit('stock');
