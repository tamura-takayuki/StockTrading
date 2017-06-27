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
var st = require(__dirname+'/setting.js');// グローバル変数が定義された、設定用のファイル

/* 変数定義 */
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter;// Create EventEmitter
// var results = [];// 検索結果を格納する配列


/* 設定 */
// var mongo = { db: 'stock', collection: 'bitcoin' };
// var term = {'s': '2016/10/1', 'e': '2016/11/1'}


/* =======================================================================
Uniqe code
========================================================================== */

// 初期化
ev.on('init', function() {

    // 設定ファイルなしの場合
    if (typeof(st) == "undefined") {
        var _buyCase = [['dv_rate_24h',-0.05,'<=','&&']];
        var _sellCase = [['dv_rate_24h',0.05,'>=','&&'], ['profit',5000,'>=','&&']];
        var _assets = {
            capital : 100000,
            money : 0,
            stock : 0,
            profit : 0,
        }
        ev.emit('simulate', _buyCase, _sellCase, _assets);
    }

    // 設定ファイルありの場合
    else {

        // outputファイルの初期化
        ut.writeFile(outputFile, "", function() {
            console.log('init output file')
        });

        /* csvの読み込み */
        var _buyCases = [];
        var _sellCases = [];
        ut.readFile(buyCsvFile, function(data) {
            _buyCases = data.split('\n');
            ut.readFile(sellCsvFile, function(data) {
                _sellCases = data.split('\n');

                /* パラメータの設定 */
                ev.emit('setParams', _buyCases, _sellCases); 
            });
        });  
    }
});

// 売買ケースの配列を整形する
function formatCaseArray(data) {
    var _array = data.split(',');
    var _cases = [];
    for (var i = 0; i < _array.length; i += 4) {
        var _case = [_array[i],_array[i+1],_array[i+2],_array[i+3]];
        _cases.push(_case)
    }
    return _cases;
}

// パラメータの設定
ev.on('setParams', function(buyCases, sellCases) {

    // 1行づつ地味に更新する
    var i = 0;
    var iID = setInterval(function() {
        var _buyCase = formatCaseArray(buyCases[i]);
        var _sellCase = formatCaseArray(sellCases[i]);

        /* 収益のシミュレーション */
        var _assets = {
            capital : capitalS,
            money : moneyS,
            stock : stockS,
            profit : profitS,
        }
        ev.emit('simulate', _buyCase, _sellCase, _assets);

        i++;
        if (i == buyCases.length - 1) { clearInterval(iID); }// 最後のデータでループを抜ける
    }, 1000);
});

// 買うロジック
function buy(data, buyCase, assets) {
    for (var j = 0; j < buyCase.length; j++) {

        if (buyCase[j][2] == '<=') {
            if (data[buyCase[j][0]] <= buyCase[j][1]) {

                // 買う
                if (buyCase[j][3] == '||') { assets.stock = assets.money / data.p; assets.money = 0; break; }

                // 買う
                else if (buyCase[j][3] == '&&' && j == buyCase.length - 1) { assets.stock = assets.money / data.p; assets.money = 0; break; }

                // 次の条件へ
                else { continue; }
            }
        }

        else if (buyCase[j][2] == '>=') {
            if (data[buyCase[j][0]] >= buyCase[j][1]) {

                // 買う
                if (buyCase[j][3] == '||') { assets.stock = assets.money / data.p; assets.money = 0; break; }

                // 買う
                else if (buyCase[j][3] == '&&' && j == buyCase.length - 1) { assets.stock = assets.money / data.p; assets.money = 0; break; }

                // 次の条件へ
                else { continue; }
            }
        }

        // 買えない
        if (buyCase[j][3] == '&&') { break; }
    }
}

// 売るロジック
function sell(data, sellCase, assets) {

    for (var j = 0; j < sellCase.length; j++) {

        // 収益ベースでの売り判断
        if (sellCase[j][0] == 'profit') {
            if (sellCase[j][1] <= data.p * assets.stock - assets.capital) {

                // 売る
                if (sellCase[j][3] == '&&' && j == sellCase.length - 1) { assets.money = assets.stock * data.p; assets.stock = 0; assets.profit += assets.money - assets.capital; assets.capital = assets.money; break; }

                // 次の条件へ
                else { continue; }
            }
        }

        else if (sellCase[j][2] == '<=') {

                if (data[sellCase[j][0]] <= sellCase[j][1]) {

                // 売る
                if (sellCase[j][3] == '||') { assets.money = assets.stock * data.p; assets.stock = 0; assets.profit += assets.money - assets.capital; assets.capital = assets.money; break; }

                // 売る
                else if (sellCase[j][3] == '&&' && j == sellCase.length - 1) { assets.money = assets.stock * data.p; assets.stock = 0; assets.profit += assets.money - assets.capital; assets.capital = assets.money; break; }

                // 次の条件へ
                else { continue; }
            }
        }

        else if (sellCase[j][2] == '>=') {

            if (data[sellCase[j][0]] >= sellCase[j][1]) {

                // 売る
                if (sellCase[j][3] == '||') { assets.money = assets.stock * data.p; assets.stock = 0; break; }

                // 売る
                else if (sellCase[j][3] == '&&' && j == sellCase.length - 1) { assets.money = assets.stock * data.p; assets.stock = 0; assets.profit += assets.money - assets.capital; assets.capital = assets.money; break; }

                // 次の条件へ
                else { continue; }
            }
        }

        // 売れない
        if (sellCase[j][3] == '&&') { break; }
    }
}

// 収益の計算
function buySell(data, buyCase, sellCase, assets) {
    var _sday = new Date(term.s);
    var _eday = new Date(term.e);

    for (var i = 0; i < data.length; i++) {

        // 指定期間なら
        if (data[i].t*1000 >= _sday.getTime() && data[i].t*1000 <= _eday.getTime()) {

            /* 買う */
            if (assets.money > 0) { buy(data[i], buyCase, assets); }

            /* 売る */
            if (assets.stock > 0) { sell(data[i], sellCase, assets); }
        }
    }
}

// 収益を計上
function profitAddup(buyCase, sellCase, assets) {
    
    // 設定ファイルなしの場合
    if (typeof(st) == "undefined") {
        console.log("/* 収益計上 */"); 
        console.log('profit => ' + assets.profit);
        console.log('stock => ' + assets.stock); 
        console.log('money => ' + assets.money);
    }

    // 設定ファイルありの場合
    else {
        var _row = '';
        for (var i = 0; i < buyCase.length; i++) {
            _row += '[' + buyCase[i][0] + '=' + buyCase[i][1] + ']';
        }
        _row += '|';
        for (var i = 0; i < sellCase.length; i++) {
            _row += '[' +  sellCase[i][0] + '=' + sellCase[i][1] + ']';
        }
         _row += ',' + parseInt(assets.profit) + ',' + Math.round(assets.stock*1000)/1000 + ',' + parseInt(assets.money) + '\n';
        ut.appendFile(outputFile, _row);
        console.log('profit => ' + assets.profit);
    }
}


// 収益のシミュレーション
ev.on('simulate', function(buyCase, sellCase, assets) {

    // 全データを取得
    mg.findByOption(mongo.db, mongo.collection ,{} , {'sort':'t'}, function(data) {

        /* 資本を入金 */
        assets.money = assets.capital;

        /* 売買 */
        buySell(data, buyCase, sellCase, assets);

        /* 収益を計上 */
        profitAddup(buyCase, sellCase, assets);
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
    // if (rFormat.mongo === true && results.length !== 0) {
    //     // mg.insert(mongo.db, mongo.collection, results);
    //     console.dir(results);
    // }

    // 少し待ってからプロセスを終了する
    setTimeout(function() {
        process.exit();
    }, 500);
});


ev.emit('init');
