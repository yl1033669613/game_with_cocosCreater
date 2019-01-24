cc.Class({
    extends: cc.Component,
    properties: {

    },
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
        const self = this;
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
        const self = this;
        self.db.collection('userGameInfo').where({
            _openid: self.openid
        }).get({
            success: res => {
                wx.hideLoading();
                if (res.data.length == 0) {
                    self.db.collection('userGameInfo').add({
                        data: self.userGameInfo,
                        success: res => {
                            console.log(res)
                        },
                        fail: err => {
                            console.log(err)
                        }
                    })
                } else {
                    self.userGameInfo = res.data[0];
                }
            },
            fail: err => {
                wx.hideLoading();
            }
        });
    },
    //获取needle level 数组
    getNeedlesLevelData() {
        const self = this;
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
})
