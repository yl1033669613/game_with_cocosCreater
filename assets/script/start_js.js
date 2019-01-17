cc.Class({
    extends: cc.Component,

    properties: {
        gameBtnPfb: {
            default: null,
            type: cc.Prefab
        },
        content: {
            default: null,
            type: cc.Node
        },
        noticePic: {
            default: null,
            type: cc.Node
        },
        bottBanner: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.noticeOpen = false;
        this.noticeLoadFirst = true;
        let scenesList = [{
            title: ' Snake',
            name: 'snake'
        }, {
            title: ' Flappy bird',
            name: 'flappy_bird'
        }, {
            title: ' Firework',
            name: 'firework'
        }, {
            title: ' 2048',
            name: 'game2048'
        }, {
            title: ' Needles',
            name: 'game_needles_start'
        }, {
            title: ' Tetris',
            name: 'tetris'
        }, {
            title: ' Aircraft war',
            name: 'aircraft_war_start'
        }];
        let y = -65;
        for (let i = 0; i < scenesList.length; i++) {
            let btn = cc.instantiate(this.gameBtnPfb); // 创建节点
            let item = btn.getComponent('game_start_btn');
            this.content.addChild(btn);
            if (i > 0) y -= 65;
            item.updateItem(i, y, scenesList[i].title, scenesList[i].name);
        };
        this.content.height = Math.abs(y) + 15;
    },

    openNotice() {
        let self = this;
        let dt = 120;
        if (!self.noticeOpen) {
            self.noticeOpen = true;
            dt = 120;
        } else {
            self.noticeOpen = false;
            dt = -120;
        };
        if (self.noticeOpen && self.noticeLoadFirst) {
            wx.showLoading({ title: '请稍候...' });
            self.loadNoticePic(() => { //wx cloud
                self.noticeMoveAction(dt);
            });
        } else {
            self.noticeMoveAction(dt);
        }
    },

    noticeMoveAction(dt) {
        let moveAction = cc.moveBy(.6, 0, dt).easing(cc.easeBounceOut(.6));
        this.bottBanner.runAction(moveAction);
    },

    //加载notice wx cloud
    loadNoticePic(cb) {
        let self = this;
        let sprite = self.noticePic.getComponent(cc.Sprite);
        let db = wx.cloud.database();
        db.collection('gameConfig').doc('W9J4AAIrVDZJFtdW').get({
            success: (ret) => {
                let arr = [];
                arr.push(ret.data.indexBottomBanner);
                wx.cloud.getTempFileURL({
                    fileList: arr,
                    success: res => {
                        wx.hideLoading();
                        self.noticeLoadFirst = false;
                        cb && cb();
                        cc.loader.load(res.fileList[0].tempFileURL, (err, texture) => {
                            sprite.spriteFrame = new cc.SpriteFrame(texture);
                            self.noticePic.parent.height = self.noticePic.height;
                        })
                    },
                    fail: err => {
                        wx.hideLoading();
                        console.log(err)
                    }
                })
            },
            fail: e => {
                wx.hideLoading();
                console.log(e)
            }
        })
    }
})
