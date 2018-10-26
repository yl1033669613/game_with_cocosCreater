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

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.noticeOpen = false;
        this.noticeLoadFirst = true;
        let scenesList = [{
            title: ' snake',
            name: 'snake'
        }, {
            title: ' flappy bird',
            name: 'flappy_bird'
        }, {
            title: ' firework',
            name: 'firework'
        }, {
            title: ' 2048',
            name: 'game2048'
        }, {
            title: ' needles',
            name: 'game_needles_start'
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
        let dt = 120,
            moveAction;
        if (!this.noticeOpen) {
            this.noticeOpen = true;
            dt = 125;
        } else {
            this.noticeOpen = false;
            dt = -125;
        };
        moveAction = cc.sequence(cc.moveBy(.2, 0, dt).easing(cc.easeOut(.2)), cc.callFunc(function() {
            if (this.noticeOpen && this.noticeLoadFirst) {
                wx.showLoading({ title: '请稍候...' });
                this.loadNoticePic();
            }
        }, this));
        this.bottBanner.runAction(moveAction);
    },

    //加载notice
    loadNoticePic() {
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
                        cc.loader.load(res.fileList[0].tempFileURL, function(err, texture) {
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
});
