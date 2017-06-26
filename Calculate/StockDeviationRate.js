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

// 移動平均乖離率の計算
function calculateDeviationRate(data, section, term) {
    var _total = 0;
    var _mv_avrg = 0;
    var _dv_rate = 0;
    var _results = [];

    // 計算
    for (var i = 0; i < data.length; i++) {

        // すでに計算済みならスキップ
        // if (data[i]['dv_rate_' + section] !== undefined) { continue; }
        if (typeof data[i]['dv_rate_' + section] !== 'undefined') { continue; }
        // if ('dv_rate_' + section in data[i]) { continue; }
        // if (data[i].hasOwnProperty('dv_rate_' + section)) { continue; }

        // 初期値を算出さるための準備
        if (i < term - 1) {
            _total = _total + data[i].e_p_a;
            data[i]['mv_avrg_' + section] = 0;
            data[i]['dv_rate_' + section] = 0;
            _results.push(data[i]);
        }

        // 初期値なら
        else if (i == term - 1) {

            /* 指数移動平均 */
            _total = _total + data[i].e_p_a;
            _mv_avrg = _total / term;
            data[i]['mv_avrg_' + section] = Math.round(_mv_avrg*1000)/1000; // 小数点以下４桁を四捨五入

            /* 指数移動平均乖離率 */
            _dv_rate = (data[i].e_p_a - data[i]['mv_avrg_' + section]) / data[i]['mv_avrg_' + section] * 100;
            data[i]['dv_rate_' + section] = Math.round(_dv_rate*1000)/1000; // 小数点以下４桁を四捨五入
            _results.push(data[i]);
        }

        // 指数移動平均の計算
        else {

            /* 指数移動平均 */
            _mv_avrg = data[i-1]['mv_avrg_' + section] + (data[i].e_p_a - data[i-1]['mv_avrg_' + section]) * 2 / (term+1);
            data[i]['mv_avrg_' + section] = Math.round(_mv_avrg*1000)/1000; // 小数点以下４桁を四捨五入

            /* 指数移動平均乖離率 */
            _dv_rate = (data[i].e_p_a - data[i]['mv_avrg_' + section]) / data[i]['mv_avrg_' + section] * 100;
            data[i]['dv_rate_' + section] = Math.round(_dv_rate*1000)/1000; // 小数点以下４桁を四捨五入
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
            'mv_avrg_5d': results[i].mv_avrg_5d,
            'mv_avrg_20d': results[i].mv_avrg_20d,
            'dv_rate_5d': results[i].dv_rate_5d,
            'dv_rate_20d': results[i].dv_rate_20d,
        }
        
        // DBの更新
        mg.update(mongo.db, 'price_' + code , { _id: results[i]._id }, _data, function(data) {
            console.dir(data);
        });

        i++;
        if (i == results.length) { clearInterval(iID); }// 最後のデータでループを抜ける
    }, 100); 
}

ev.on('stocks', function() {

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
                var _term = 0;

                /* 移動平均乖離率の計算 */
                _section = '5d';
                _term = 1 * 5;
                var _r1 = calculateDeviationRate(price, _section, _term);

                /* 移動平均乖離率の計算 */
                _section = '20d';
                _term = 1 * 20;
                var _r2 = calculateDeviationRate(price, _section, _term);

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


ev.emit('stocks');
