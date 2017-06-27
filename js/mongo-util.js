/**
 * mnogodb util functions
 */
 
/* read modules */
var MongoClient = require('mongodb').MongoClient;

/* valiables */
var url = 'mongodb://127.0.0.1/';


/* =======================================================================
Functions
========================================================================== */

module.exports = {

    /**
     * MongoDBにinsertする
     * param db => DB名, collection => collection名, data => insertするデータ, cb => callback
     */
    insert : function(db, collection, data, cb) {

        MongoClient.connect(url + db, function(err, db){

            // エラーならログを出力して終了
            if (err) { return console.log(err); }
            
            // dataをDBへinsertする
            db.collection(collection).insert(data, function(err, res){

                // エラーならログを出力して終了
                if (err) { return console.log(err); }
                
                // 結果を出力する
                // console.dir(res);

                db.close();

                if (cb) { cb(); }
            });
        });
    },


    /**
     * MongoDBのデータを更新する
     * param db => DB名, collection => collection名, key => update対象, data => updateするデータ,
     */
    update : function(db, collection, key, data, cb) {

        MongoClient.connect(url + db, function(err, db){

            // エラーならログを出力して終了
            if (err) { return console.dir(err);}

            // DBへの接続に成功
            // console.log("connected to db");

            // collectionへアクセスする
            db.collection(collection, function(err, collection){

                // dataに該当するデータをupdateする
                collection.update(key, {$set: data}, function(err, result){
                    // console.dir(result);// 結果を出力する
                    if (cb) { cb(data); }
                    db.close();// monogodbとの接続を切る
                });
            });
        });
    },


    /**
     * MongoDBからremoveする
     * param db => DB名, collection => collection名, key => remove対象
     */
    remove : function(db, collection, key) {

        MongoClient.connect('mongodb://127.0.0.1/' + db, function(err, db){

            // エラーならログを出力して終了
            if (err) { return console.dir(err);}

            // DBへの接続に成功
            console.log("connected to db");

            // collectionへアクセスする
            db.collection(collection, function(err, collection){

                // keyをDBからremoveする
                collection.remove(key, function(err, result) {
                    // console.dir(result);// 結果を出力する
                    db.close();// monogodbとの接続を切る
                });
            });
        });
    },


    /**
     * MongoDBのデータをすべて取得する
     * param db => DB名, collection => collection名, cb => callback
     */
    findAll : function(db, collection, cb) {

        MongoClient.connect('mongodb://127.0.0.1/' + db, function(err, db){

            // エラーならログを出力して終了
            if (err) { return console.dir(err);}

            // DBへの接続に成功
            console.log("connected to db");

            // collectionへアクセスする
            db.collection(collection, function(err, collection){

                // monogodbを全容検索する
                collection.find({}).toArray(function(err, data){
                    // console.dir(data);
                    cb(data);
                    db.close();// monogodbとの接続を切る
                });
            });
        });
    },


    /**
     * MongoDBの特定のデータを取得する
     * param db => DB名, collection => collection名, query => query for search, cb => callback
     */
    findBy : function(db, collection, key, cb) {

        MongoClient.connect(url + db, function(err, db){

            // エラーならログを出力して終了
            if (err) { return console.log(err);}

            // monogodbを検索する
            db.collection(collection).find(query).toArray(function(err, result){

                // エラーならログを出力して終了
                if (err) { return console.dir(err);}
                
                // 結果を出力する
                // console.dir(res);

                db.close();

                if (cb) { cb(); }
            });
        });
    },


    /**
     * MongoDBをoptionを指定して検索
     * param db => DB名, collection => collection名, key => key for search, sort => sort case, cb => callback
     */
    findByOption : function(db, collection, key, option, cb) {

        MongoClient.connect('mongodb://127.0.0.1/' + db, function(err, db){

            // エラーならログを出力して終了
            if (err) { return console.dir(err);}

            // DBへの接続に成功
            // console.log("connected to db");

            // collectionへアクセスする
            db.collection(collection, function(err, collection){

                // monogodbを全容検索する
                collection.find(key, option).toArray(function(err, data){
                    // console.dir(data);
                    cb(data);
                    db.close();// monogodbとの接続を切る
                });
            });
        });
    },


    /**
     * MongoDBの特定のデータを取得する
     * param db => DB名, collection => collection名, key => distinct key, cb => callback
     */
    distinct : function(db, collection, key, cb) {

        MongoClient.connect('mongodb://127.0.0.1/' + db, function(err, db){

            // エラーならログを出力して終了
            if (err) { return console.dir(err);}

            // DBへの接続に成功
            console.log("connected to db");

            // collectionへアクセスする
            db.collection(collection, function(err, collection){

                // monogodbのdistinctされた要素を取得する
                collection.distinct(key, function(err, data){
                    // console.dir(data);
                    cb(data);
                    db.close();// monogodbとの接続を切る
                });
            });
        });
    },

}

