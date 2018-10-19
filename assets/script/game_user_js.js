cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.addPersistRootNode(this.node);

        wx.cloud.init({
            env: 'dev-47dfcd'
        });

        this.db = wx.cloud.database();

        this.openid = '';
        this.userGameInfo = {
            'snakeBestScore': 0,
            'fbBestScore': 0,
            'tzfeBestScore': 0,
            'tzfeWinNum': 0,
            'createTime': this.db.serverDate(),
            'updateTime': this.db.serverDate()
        };
    },

    login() {
        let self = this;
        wx.cloud.callFunction({
            name: 'login',
            success: res => {
                // console.log('callFunction test result: ', res)
                self.openid = res.result.openid;
                self.checkRecordFromDatabase();
            },
            fail: err => {
                console.log(err)
            }
        });
    },

    checkRecordFromDatabase() {
        let self = this;
        self.db.collection('userGameInfo').where({
            _openid: self.openid
        }).get({
            success: function(res) {
                // console.log(res)
                if (res.data.length == 0) {
                    self.db.collection('userGameInfo').add({
                        data: self.userGameInfo,
                        success: function(res) {
                            console.log(res)
                        },
                        fail: function(err) {
                            console.log(err)
                        }
                    })
                } else {
                    self.userGameInfo = res.data[0];
                }
            }
        });
    },

    setUserGameInfo (key, data){
        this.userGameInfo[key] = data
    },

    start() {
        this.login();
    }
});
