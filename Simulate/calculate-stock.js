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
var st = require(__dirname+'/setting-stock.js');// グローバル変数が定義された、設定用のファイル

/* 変数定義 */
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter;// Create EventEmitter
var results = [];// 検索結果を格納する配列
var buyCaseRow;
var term = 5*4*12;// シミュレート期間 日*週*月

/* =======================================================================
Uniqe code
========================================================================== */

// 初期化
ev.on('init', function() {

    // 設定ファイルなしの場合
    if (typeof(st) == "undefined") {
        console.log("[error] No setting file")
    }

    // 設定ファイルありの場合
    else {

        /* csvの読み込み */
        var _buyCases = [];
        ut.readFile(buyCsvFile, function(data) {
            buyCasesRow = data.split('\n');

            ev.emit('stocks', _buyCases);
        });
    }
});

// メイン処理
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
            ev.emit('simulate', _code, _c_name);

            // twitterアカウントの数だけループ
            _count++;
            if (_count === data.length) { clearInterval(_tID); }

        }, 5*1000);
    });
});


// 収益の計算
function buySell(data, buyCase, c_name) {
    var _bp = [];// 買う位置
    var _pf = [];// 収益
    data = data.reverse()

    /* 買う */
    for (var i = 0; i < data.length; i++) {
        // 最終購買日から1日空ける
        if (_bp.length && i == _bp[_bp.length - 1] + 1) { continue; }

        // RSIが0ならスキップ
        if (buyCase[0].substr(0,3) == 'rsi' && data[i][buyCase[0]] == 0 ) { continue; }

        // if (buyCase[2] == '<=') {
        //     if (data[i][buyCase[0]] <= buyCase[1]) { _bp.push(i); }
        // } else if (buyCase[2] == '==') {
        //     if (data[i][buyCase[0]] == buyCase[1]) { _bp.push(i); }
        // } else if (buyCase[2] == '>=') {
        //     if (data[i][buyCase[0]] >= buyCase[1]) { _bp.push(i); }
        // }

        if (buyCase[2] == '<=') {
            if (data[i][buyCase[0]] <= buyCase[1]) { _bp.push(i+1); }
        } else if (buyCase[2] == '==') {
            if (data[i][buyCase[0]] == buyCase[1]) { _bp.push(i+1); }
        } else if (buyCase[2] == '>=') {
            if (data[i][buyCase[0]] >= buyCase[1]) { _bp.push(i+1); }
        }
    }

    /* 1週間で売れる最も高い値段を計算 */
    for (var i = 0; i < _bp.length; i++) {

    	// 買えないケース
    	if (data[_bp[i]] == undefined || data[_bp[i]-1].e_p_a == undefined || data[_bp[i]].l_p == undefined) { continue; }
    	if (data[_bp[i]-1].e_p_a - 1 < data[_bp[i]].l_p) { continue; }

        var _buyPrice = data[_bp[i]-1].e_p_a - 1;
        var _sellPrice = _buyPrice;
        if (data[_bp[i]+5] !== undefined) {
            for(var j = 1; j < 6; j++) {
                if (data[_bp[i]+j].e_p_a > _sellPrice) { _sellPrice = data[_bp[i]+j].e_p_a; }
            }
        }
        _pf.push((_sellPrice - _buyPrice) * Math.floor(capitalS / _buyPrice));
    }

    /* 集計 */
    // if (_pf.length !== 0) {
    if (_pf.length >= 3) {
        _pf.sort(function(a,b){
            if( a < b ) return -1;
            if( a > b ) return 1;
            return 0;
        });

        // 平均値
        var _sum = 0
        for (var i = 0; i < _pf.length; i++) { _sum += _pf[i]; };
        var _avrg = Math.floor(_sum / _pf.length);
        // 中央値
        var _median = _pf[Math.floor(_pf.length / 2)];
        // 最頻値
        var _dist = [0, 0, 0, 0, 0, 0];
        for (var i = 0; i < _pf.length; i++) { 
            if (_pf[i] < 1000) { _dist[0] += 1; }
            else if (_pf[i] < 5000) { _dist[1] += 1; }
            else if (_pf[i] < 10000) { _dist[2] += 1; }
            else if (_pf[i] < 20000) { _dist[3] += 1; }
            else if (_pf[i] < 30000) { _dist[4] += 1; }
            else { _dist[5] += 1; }
        };
        var _mode = _dist.indexOf(Math.max.apply(null,_dist));

        // 結果を格納
        results[c_name].push([buyCase[0],buyCase[1],_avrg,_median,_mode]);
    }
}


// 集計
function Aggregate(code, c_name) {

    // 各最大値を見つける
    var _maxAvrg = 0;
    var _maxMed = 0;
    var _maxMode = 0;
    var _row = '';
    for (var i = 0; i < results[c_name].length; i++) {
        if (results[c_name][i][2] > _maxAvrg) { _maxAvrg = results[c_name][i][2]; }
        if (results[c_name][i][3] > _maxMed) { _maxMed = results[c_name][i][3]; }
        if (results[c_name][i][4] > _maxMode) { _maxMode = results[c_name][i][4]; }
        _row += results[c_name][i][0] + "," + results[c_name][i][1] + "," + results[c_name][i][2] + "," + results[c_name][i][3] + "," + results[c_name][i][4] + '\n';
    }

    // resultsをファイルに記載
    ut.writeFile(outputDir + '/' + code + '-output.csv', _row, function() {
        console.log('create output file ' + code);
    });

    // outputファイルに結果を追記
    for (var i = 0; i < results[c_name].length; i ++) {
        if (results[c_name][i][2] == _maxAvrg || results[c_name][i][3] == _maxMed || results[c_name][i][4] == _maxMode) { 
            var _row = code + "," +results[c_name][i][0] + "," + results[c_name][i][1] + "," + results[c_name][i][2] + "," + results[c_name][i][3] + "," + results[c_name][i][4] + '\n';
            ut.appendFile(outputFile, _row);
        }
    }
}


// 売買ケースの配列を整形する
function formatCaseArray(data) {
    var _array = data.split(',');
    var _cases = [];
    for (var i = 0; i < _array.length; i += 4) {
        var _case = [_array[i],_array[i+1],_array[i+2],_array[i+3]];
        _cases.push(_case);
    }
    return _cases;
}


// 収益のシミュレーション
ev.on('simulate', function(code, c_name) {

    // 株価をすべて取得
    mg.findByOption(mongo.db, 'price_' + code, {}, {'sort': {"d":-1}, 'limit': term}, function(data) {

        var i = 0;
        var iID = setInterval(function() {
            var _buyCase = buyCasesRow[i].split(',');

            /* 売買 */
            console.log(_buyCase)
            buySell(data, _buyCase, c_name);

            i++;
            if (i == buyCasesRow.length - 1) {

                /* 集計 */
                Aggregate(code, c_name);
                
                // 最後のデータでループを抜ける
                clearInterval(iID);
            }
        }, 200);
    });
});


// プロセスが終了する間際に呼ばれる
process.on('beforeExit', function () {

    // 少し待ってからプロセスを終了する
    setTimeout(function() {
        process.exit();
    }, 500);
});


ev.emit('init');
