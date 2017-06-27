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
function calculateBoliBand(data, section, term, span) {
    var _results = [];

    // 計算
    for (var i = 0; i < data.length; i++) {

        // 移動平均が見計算なら、処理をしない
        if (typeof data[i]['mv_avrg_' + section] == 'undefined') { console.log('[error] MoveAvrg is not calculated'); break; }

        // すでに計算済みならスキップ
        if (typeof data[i]['bri_' + section] !== 'undefined') { continue; }

        // 時間が計算対象でなければ直前の値を格納して、スキップ
        if (i % span != 0) {
            data[i]['bri_' + section] = data[i-1]['bri_' + section];
            data[i]['sd_' + section] = data[i-1]['sd_' + section];
            _results.push(data[i]);
            continue;
        }

        // 最初値導出以前は、スキップ
        if (i < term) {
            data[i]['bri_' + section] = 0
            data[i]['sd_' + section] = 0
            _results.push(data[i]);
            continue;
        }

        // 標準偏差の計算
        var _uper = 0
        for (var j = 0; j < (term / span); j++) {
            _uper += Math.pow((data[i-j].e_p_a - data[i]['mv_avrg_' + section]), 2);
        }
        _sd = Math.sqrt(_uper / (term / span - 1));
        data[i]['sd_' + section] = Math.round(_sd*1000)/1000; // 小数点以下４桁を四捨五入
        
        // ボリンジャーバンドの計算
        if (data[i].e_p_a <= data[i]['mv_avrg_' + section] - _sd * 2) {
            data[i]['bri_' + section] = - 2;
        } else if (data[i].e_p_a <= data[i]['mv_avrg_' + section] - _sd && data[i].e_p_a > data[i]['mv_avrg_' + section] - _sd * 2) {
            data[i]['bri_' + section] = - 1;
        } else if (data[i].e_p_a <= data[i]['mv_avrg_' + section] + _sd && data[i].e_p_a > data[i]['mv_avrg_' + section] - _sd) {
            data[i]['bri_' + section] = 0;
        } else if (data[i].e_p_a <= data[i]['mv_avrg_' + section] + _sd * 2 && data[i].e_p_a > data[i]['mv_avrg_' + section] + _sd) {
            data[i]['bri_' + section] = + 1;
        } else if (data[i].e_p_a > data[i]['mv_avrg_' + section] + _sd * 2) {
            data[i]['bri_' + section] = + 2;
        }

        _results.push(data[i]);
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
            'bri_5d': results[i].bri_5d,
            'sd_5d': results[i].sd_5d,
            'bri_20d': results[i].bri_20d,
            'sd_20d': results[i].sd_20d,
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
                var _span = 0;
                var _term = 0;

                /* RSIの計算 */
                _section = '5d';
                _span = 1;
                _term = _span * 5;
                var _r1 = calculateBoliBand(price, _section, _term, _span);

                /* RSIの計算 */
                _section = '20d';
                _span = 1;
                _term = _span * 20;
                var _r2 = calculateBoliBand(price, _section, _term, _span);

                /* 計算結果の統合 */
                var _results = Object.assign(_r1, _r2);

                /* DBの更新 */
                if (_results.length != 0) {
                    // console.dir(_results);
                    updateDB(_results, _code);
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
