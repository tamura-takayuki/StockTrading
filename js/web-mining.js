/**
 * ウェブマインにングの関数とか設定とか
 */
 
/* モジュールの読み込み */
var fs = require('fs');
var ph = require('path');
var client = require('cheerio-httpcli');
var imgSavePath = '/path/to/save.jpg';

/* =======================================================================
Functions
========================================================================== */


module.exports = {
    
    /**
     * Get html by url
     * param url-> target url, cb-> callback
     */
    getHtml : function(url, cb) {
        client.fetch(url, function (err, $, res, body) {
            if (err) {
                return console.log(err);
            } else {
                cb($, res, body);
            }
        });
    },


    /**
     * Get html by url with query
     * param url-> target url, q -> query string, cb-> callback
     */
    getHtmlQuery : function(url, q, cb) {
        client.fetch(url, q, function (err, $, res, body) {
            if (err) {
                return console.log(err);
            } else {
                cb($, res, body);
            }
        });
    },


    /**
     * download samthing to folder
     * param path-> path to save image, cb-> callball
     */
    downloadToFolder : function(path, cb) {
        imgSavePath = path;
        cb();
    },


    /**
     * ダウンロードマネージャーを作る
     * param cb-> callback
     */
    createDownloadManager : function(cb) {

        client.download.on('ready', function (stream) {
            stream.pipe(fs.createWriteStream(imgSavePath));
            console.log(stream.url.href + 'をダウンロードしました');
        })
        .on('error', function (err) {
            console.error(err.url + 'をダウンロードできませんでした: ' + err.message);
        })
        .on('end', function () {
            console.log('ダウンロードが完了しました');
            cb();
        });
    },

}

