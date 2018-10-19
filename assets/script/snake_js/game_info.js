cc.Class({
    extends: cc.Component,

    properties: {
        canvas: {
            default: null,
            type: cc.Node
        },
        btn1: {
            default: null,
            type: cc.Node
        },
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        bestScore: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let theScore = this.canvas.getComponent("snake_game").score;
        this.scoreLabel.string = "Score:" + theScore.toString();

        let globalNode = cc.director.getScene().getChildByName('gameUser').getComponent('game_user_js');
        let bestScore = globalNode.userGameInfo.snakeBestScore || 0;
        let db = wx.cloud.database();

        if (theScore > bestScore) {
            bestScore = theScore;
            globalNode.setUserGameInfo('snakeBestScore', bestScore);
            db.collection('userGameInfo').where({
                _openid: globalNode.openid
            }).get({
                success: function(res) {
                    db.collection('userGameInfo').doc(res.data[0]._id).update({
                        data: {
                            'snakeBestScore': bestScore,
                            'updateTime': db.serverDate()
                        },
                        success: function(sc) {
                            console.log('保存成功')
                        }
                    })
                }
            })
        };

        this.bestScore.string = 'best:' + bestScore;

        this.btn1.on(cc.Node.EventType.TOUCH_START, (e) => {
            this.node.runAction(
                cc.sequence(
                    cc.fadeOut(0.2),
                    cc.callFunc(() => {
                        // 加载列表
                        cc.director.loadScene('snake');
                    }, this)
                )
            );
        }, this)
    },

    backToList() {
        cc.director.loadScene('startscene');
    }
});
