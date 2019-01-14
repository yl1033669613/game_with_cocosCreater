cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.addPersistRootNode(this.node); //设置常驻节点

        wx.cloud.init();

        this.db = wx.cloud.database();

        this.openid = '';

        this.userGameInfo = {
            'snakeBestScore': 0,

            'fbBestScore': 0,

            'tzfeBestScore': 0,
            'tzfeWinNum': 0,

            needleFreeModeScore: 0,
            needleLevelModeLevels: 1,

            tetrisBestScore: 0,
            
            aircraftWarBestScore: 0,

            'createTime': this.db.serverDate(),
            'updateTime': this.db.serverDate()
        };

        this.needleLevelData = [{
            level: 1,
            speed: 12,
            generatedNeedlesAngle: [90],
            needlesNum: 6
        }];
    },

    login() {
        let self = this;
        wx.showLoading({
            title: '请稍候...',
            mask: true 
        });
        wx.cloud.callFunction({
            name: 'login',
            success: res => {
                self.openid = res.result.openid;
                self.checkRecordFromDatabase();
            },
            fail: err => {
                wx.hideLoading();
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
                wx.hideLoading();
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
            },
            fail: function(err) {
                wx.hideLoading();
            }
        });
    },

    //获取needle level 数组
    getNeedlesLevelData() {
        let self = this;
        wx.cloud.callFunction({
            name: 'getNeedleLevel',
            success: res => {
                self.needleLevelData = res.result.data;
            },
            fail: err => {
                console.log(err)
            }
        });
    },

    setUserGameInfo(key, data) {
        this.userGameInfo[key] = data
    },

    start() {
        this.login();
        this.getNeedlesLevelData();
    }
});
