/**
 * util functions
 */
 
/* read modules */
var http = require('http');
var fs = require('fs');



/* =======================================================================
Functions
========================================================================== */

module.exports = {

    /**
     * Write output to text
     * param file-> file name, data-> written strings, cb -> callback
     */
    writeFile : function(file, data, cb) {
         fs.writeFile(file, data, 'utf8', (err) => {
             if (err) throw err;
             else { console.log(data); cb(); }
         });
    },


    /**
     * Write output to text without overrite.
     * param file-> file name, data-> written strings
     */
    appendFile : function(file, data) {
         fs.appendFile(file, data, 'utf8', (err) => {
             if (err) throw err;
             else { console.log(data); }
         });
     },


    /**
     * Reads the entire contents of a file.
     * param file-> file name, cb-> callback
     */
    readFile : function(file, cb) {
         fs.readFile(file, 'utf8', (err, data) => {
             if (err) throw err;
             else { cb(data); }
         });
    },

    /**
     * 日付を返す
     * param f => format
     */
    date : function(format) {

        // 今日の日付で Date オブジェクトを作成
        var now = new Date();

        // 「年」「月」「日」「曜日」を Date オブジェクトから取り出してそれぞれに代入
        var y = now.getFullYear();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        var w = now.getDay();
        var hr = now.getHours(); // 時
        var mi = now.getMinutes(); // 分
        var sc = now.getSeconds(); // 秒

        // 曜日の表記を文字列の配列で指定
        var wNames = ['日', '月', '火', '水', '木', '金', '土'];

        // 「月」と「日」で1桁だったときに頭に 0 をつける
        if (m < 10) {
          m = '0' + m;
        }
        if (d < 10) {
          d = '0' + d;
        }
        if (hr < 10) {
          hr = '0' + hr;
        }
        if (mi < 10) {
          mi = '0' + mi;
        }
        if (sc < 10) {
          sc = '0' + sc;
        }

        // フォーマットを整形してコンソールに出力
        console.log(y + '年' + m + '月' + d + '日 (' + wNames[w] + ')');

        // 結果のフォーマットを指定
        var result = '';
        if (format === "something") {
            //
        }

        // デフォルト
        else {
            result = y + m + d + '_' + hr + mi + sc;
        }

        return result;
    },


    /**
     * jsonをcsv形式に変換する
     * param data => 変換するデータ, header => csvのヘッダ
     */
    jsonToCsv : function(data, header) {
        var result = '';// 結果の格納用文字列
        
        // ヘッダを作る
        for (var i = 0; i < header.length; i++) {
            result += header[i] + ',';
        }
        result += '\n';

        // ボディを作る
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < header.length; j++) {
                result += data[i][header[j]] + ',';
            }
            result += '\n';
        }
        
        console.log(result);

        return result;
    },

}

