/**
 * slack util functions
 */
 
/* read modules */
var Slack = require('slack-node');

/* webhookUri の設定 */
var slack = new Slack();
var webhookUri = "https://hooks.slack.com/services/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";
slack.setWebhook(webhookUri);


/* =======================================================================
Functions
========================================================================== */

module.exports = {

    /**
     * slackに投稿
     * param ch => channel, user => user name, ic => icon image, txt => 投稿内容
     */
    post : function(ch, ur, ic, txt) {

        // slackに投稿する
        slack.webhook({
            channel: ch,
            username: ur,
            icon_emoji: ic,
            text: txt,
        }, function(err, response) {

            // エラーならログを出力して終了
            if (err) { return console.dir(err); }
            
            // 結果の出力
            console.dir(response);
        });
    },
}

