const Utils = require('./utils.js');

cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad() {
        cc.game.addPersistRootNode(this.node); //设置常驻节点
        if (cc.sys.platform === cc.sys.WECHAT_GAME) { //判断微信环境
            wx.cloud.init();
            this.db = wx.cloud.database();
            this.openid = '';
            this.wxEnv = true;
        };
        this.userGameInfo = {
            snakeBestScore: 0, //snake best score
            fbBestScore: 0, //Flappy bird best score
            tzfeBestScore: 0, //2048 best score
            tzfeWinNum: 0, // 2048 完成次数
            needleFreeModeScore: 0, // needle free mode score
            needleLevelModeLevels: 1, //needle level mode level
            tetrisBestScore: 0, //tetris best score
            aircraftWarBestScore: 0, //aircraft war best score
            donttWhiteBlockScore: 0, //dont touch white block best score
            ftcBestScore: 0, //follow the circle best score
            ftcBestCombo: 0, //follow the circle best combo
            fruitNinjaBestScore: 0, //fruit ninja best score
            skyscraperBestScore: 0 //skyscraper best score
        };
        //needle level list default
        this.needleLevelData = [{
                level: 1,
                speed: 12,
                needlesNum: 6,
                generatedNeedlesAngle: [90]
            }, {
                level: 2,
                speed: 12,
                needlesNum: 10,
                generatedNeedlesAngle: [90, 180, 270]
            },
            {
                level: 3,
                speed: 10,
                needlesNum: 10,
                generatedNeedlesAngle: [0, 60, 120, 180, 240, 300]
            },
            {
                level: 4,
                speed: 10,
                needlesNum: 15,
                generatedNeedlesAngle: [50, 100, 130, 200, 230, 300]
            },
            {
                level: 5,
                speed: 8,
                needlesNum: 15,
                generatedNeedlesAngle: [20, 40, 100, 120, 140, 200, 220, 300]
            },
            {
                level: 6,
                speed: 6,
                needlesNum: 17,
                generatedNeedlesAngle: [80, 160, 240, 320]
            },
            {
                level: 7,
                speed: 5,
                needlesNum: 19,
                generatedNeedlesAngle: [50, 90, 140, 200, 270]
            }
        ]
    },
    start() {
        if (this.wxEnv) {
            this.login();
            this.getNeedlesLevelData();
        } else {
            this.setLocalStorageForGameInfo();
        };
        Utils.GD = this;
    },
    /**
     * 设置localstorage userGameInfo
     * @param  {Object} data 设置值的对象
     */
    setLocalStorageForGameInfo(data) {
        if (localStorage) { //判断localStorage
            let gameInfo = localStorage.getItem('userGameInfo');
            if (data) {
                let gameInfoObj = JSON.parse(gameInfo);
                Object.keys(data).forEach(a => {
                    gameInfoObj[a] = data[a];
                });
                localStorage.setItem('userGameInfo', JSON.stringify(gameInfoObj));
            } else {
                if (!gameInfo) localStorage.setItem('userGameInfo', JSON.stringify(this.userGameInfo));
            }
        }
    },
    /**
     * 显示隐藏
     * @param  {Boolean} bool 
     */
    showWxLoading(bool) {
        if (this.wxEnv) {
            if (bool) {
                wx.showLoading({
                    title: '请稍候...',
                    mask: true
                });
            } else {
                wx.hideLoading();
            }
        }
    },
    /**
     * 设置user game info item
     * @param  {String} key 键
     * @param  {Any} data 值
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
        if (self.wxEnv) {
            self.db.collection(opt.collectionName).doc(opt.id).get({
                success: res => {
                    opt.success(res)
                },
                fail: err => {
                    opt.fail && opt.fail(err)
                }
            })
        } else {
            opt.success()
        }
    },
    /**
     * get Data by Where 
     * @param  {Object} opt {collectionName:String, whereCondi: Object, success: Function, fail: Function}
     */
    collectionWhere(opt) {
        const self = this;
        if (self.wxEnv) {
            self.db.collection(opt.collectionName).where(opt.whereCondi).get({
                success: res => {
                    opt.success(res)
                },
                fail: err => {
                    opt.fail && opt.fail(err)
                }
            })
        } else {
            opt.success()
        }
    },
    /**
     * 集合新增
     * @param  {Object} opt {collectionName:String, data: Object, success: Function, fail: Function}
     */
    collectionAdd(opt) {
        const self = this;
        if (self.wxEnv) {
            self.db.collection(opt.collectionName).add({
                data: opt.data,
                success: res => {
                    opt.success(res)
                },
                fail: err => {
                    opt.fail && opt.fail(err)
                }
            })
        } else {
            opt.success()
        }
    },
    /**
     * 更新
     * @param  {Object} opt {collectionName:String, whereCondi: Object, data: Object, success: Function, fail: Function}
     */
    collectionUpdate(opt) {
        const self = this;
        if (self.wxEnv) {
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
        } else {
            this.setLocalStorageForGameInfo(opt.data);
            opt.success();
        }
    },
    //app login *基于微信云开发
    login() {
        const self = this;
        self.showWxLoading(true);
        wx.cloud.callFunction({
            name: 'login',
            success: res => {
                self.openid = res.result.openid;
                self.checkRecordFromDatabase();
            },
            fail: err => {
                self.showWxLoading(false);
                console.log(err)
            }
        });
    },
    //判断是否为首次进入 如果是则创建用户 *基于微信云开发
    checkRecordFromDatabase() {
        const self = this;
        self.collectionWhere({
            collectionName: 'userGameInfo',
            whereCondi: {
                _openid: self.openid
            },
            success: res => {
                self.showWxLoading(false);
                if (res.data.length == 0) {
                    let obj = {};
                    Object.keys(self.userGameInfo).forEach(a => {
                        obj[a] = self.userGameInfo[a];
                    });
                    obj.createTime = self.db.serverDate(); //date create time
                    obj.updateTime = self.db.serverDate(); //date update time
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
                self.showWxLoading(false);
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
                if (ret) {
                    let arr = [];
                    arr.push(ret.data.indexBottomBanner);
                    wx.cloud.getTempFileURL({
                        fileList: arr,
                        success: res => {
                            callback && callback(res);
                        },
                        fail: e => {
                            self.showWxLoading(false);
                            console.log(e)
                        }
                    })
                } else {
                    callback && callback();
                }
            },
            fail: err => {
                self.showWxLoading(false);
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
                if (ret) {
                    let arr = [];
                    arr.push(ret.data.loopbg);
                    wx.cloud.getTempFileURL({
                        fileList: arr,
                        success: res => {
                            callback && callback(res)
                        },
                        fail: e => {
                            self.showWxLoading(false);
                            console.log(e)
                        }
                    })
                } else {
                    callback && callback()
                }
            },
            fail: err => {
                self.showWxLoading(false);
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