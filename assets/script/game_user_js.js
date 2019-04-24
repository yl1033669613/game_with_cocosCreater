const Utils = require('./utils.js');

cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad() {
        cc.game.addPersistRootNode(this.node); //设置常驻节点
        if(wx && wx.cloud){ //判断微信对象
            wx.cloud.init();
            this.db = wx.cloud.database();
        };
        this.openid = '';
        this.userGameInfo = {
            snakeBestScore: 0, //snake best score
            fbBestScore: 0, //Flappy bird best score
            tzfeBestScore: 0, //2048 best score
            tzfeWinNum: 0, // 2048 完成次数
            needleFreeModeScore: 0, // needle free mode score
            needleLevelModeLevels: 1, //meedle level mode level
            tetrisBestScore: 0, //tetris best score
            aircraftWarBestScore: 0, //aircraft war best score
            donttWhiteBlockScore: 0, //dont touch white block best score
            ftcBestScore: 0, //follow the circle best score
            ftcBestCombo: 0, //follow the circle best combo
            fruitNinjaBestScore: 0, //fruit ninja best score
            skyscraperBestScore: 0 //skyscraper best score
        };
        this.needleLevelData = [{ //needle level list
            level: 1,
            speed: 12,
            generatedNeedlesAngle: [90],
            needlesNum: 6
        }];
    },
    start() {
        this.login();
        this.getNeedlesLevelData();
        Utils.GD = this;
    },
    //app login
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
    //判断是否为首次进入 如果是则创建用户
    checkRecordFromDatabase() {
        const self = this;
        self.collectionWhere({
            collectionName: 'userGameInfo',
            whereCondi: {
                _openid: self.openid
            },
            success: res => {
                wx.hideLoading();
                if (res.data.length == 0) {
                    let obj = {};
                    Object.keys(self.userGameInfo).forEach(a => {
                        obj[a] = self.userGameInfo[a];
                    });
                    obj.createTime = this.db.serverDate(); //date create time
                    obj.updateTime = this.db.serverDate(); //date update time
                    self.collectionAdd({
                        collectionName: 'userGameInfo',
                        data: obj,
                        success: res => {
                            console.log(res);
                        },
                        fail: err => {
                            console.log(err);
                        }
                    })
                } else {
                    self.userGameInfo = res.data[0];
                }
            },
            fail: err => {
                console.log(err)
                wx.hideLoading();
            }
        })
    },
    /**
     * 设置user game info
     * @param  {String} key
     * @param  {Any} data
     */
    setUserGameInfo(key, data) {
        this.userGameInfo[key] = data
    },
    /**
     * get Data by id
     * @param  {Object} opt {collectionName:String, id: String, success: Function, fail: Function}
     */
    collectionDoc(opt) {
        const self = this;
        self.db.collection(opt.collectionName).doc(opt.id).get({
            success: res => {
                opt.success(res)
            },
            fail: err => {
                opt.fail && opt.fail(err)
            }
        })
    },
    /**
     * get Data by Where 
     * @param  {Object} opt {collectionName:String, whereCondi: Object, success: Function, fail: Function}
     */
    collectionWhere(opt) {
        const self = this;
        self.db.collection(opt.collectionName).where(opt.whereCondi).get({
            success: res => {
                opt.success(res)
            },
            fail: err => {
                opt.fail && opt.fail(err)
            }
        })
    },
    /**
     * 集合新增
     * @param  {Object} opt {collectionName:String, data: Object, success: Function, fail: Function}
     */
    collectionAdd(opt) {
        const self = this;
        self.db.collection(opt.collectionName).add({
            data: opt.data,
            success: res => {
                opt.success(res)
            },
            fail: err => {
                opt.fail && opt.fail(err)
            }
        })
    },
    /**
     * 更新
     * @param  {Object} opt {collectionName:String, whereCondi: Object, data: Object, success: Function, fail: Function}
     */
    collectionUpdate(opt) {
        const self = this;
        let obj = {};
        Object.keys(opt.data).forEach(a => {
            obj[a] = opt.data[a];
        });
        obj.updateTime = self.db.serverDate();
        self.collectionWhere({
            collectionName: opt.collectionName,
            whereCondi: opt.whereCondi,
            success: res => {
                if (res.data.length) {
                    self.db.collection(opt.collectionName).doc(res.data[0]._id).update({
                        data: obj,
                        success: ret => {
                            opt.success(ret);
                        },
                        fail: e => {
                            opt.fail && opt.fail(e)
                        }
                    })
                } else {
                    console.log('用户游戏信息不存在')
                }
            },
            fail: err => {
                opt.fail && opt.fail(err)
            }
        })
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
    //获取首页notice 
    getIndexNoticePic(callback) {
        const self = this;
        self.collectionDoc({
            collectionName: 'gameConfig',
            id: 'W9J4AAIrVDZJFtdW',
            success: ret => {
                let arr = [];
                arr.push(ret.data.indexBottomBanner);
                wx.cloud.getTempFileURL({
                    fileList: arr,
                    success: res => {
                        callback && callback(res)
                    },
                    fail: e => {
                        wx.hideLoading();
                        console.log(e)
                    }
                })
            },
            fail: err => {
                wx.hideLoading();
                console.log(err)
            }
        })
    },
    //获取Aircraft war 背景
    getAircaftWarBg(callback) {
        const self = this;
        self.collectionDoc({
            collectionName: 'gameConfig',
            id: 'XDWYPuSiwXKAQnli',
            success: ret => {
                let arr = [];
                arr.push(ret.data.loopbg);
                wx.cloud.getTempFileURL({
                    fileList: arr,
                    success: res => {
                        callback && callback(res)
                    },
                    fail: e => {
                        wx.hideLoading();
                        console.log(e)
                    }
                })
            },
            fail: err => {
                wx.hideLoading();
                console.log(err)
            }
        })
    },
    //更新分数
    updateGameScore(data, callback) {
        const self = this;
        self.collectionUpdate({
            collectionName: 'userGameInfo',
            whereCondi: {
                _openid: self.openid
            },
            data: data,
            success: res => {
                callback && callback(res)
            },
            fail: err => {
                console.log(err)
            }
        })
    }
})