const Gdt = require('globals');

cc.Class({
    extends: cc.Component,
    properties: {
        loadingBg: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        cc.director.preloadScene('aircraft_war_game');
        this.loadingBgAction();

        wx.showLoading({title: '请稍候...', mask: true});
        this.loadNoticePic()
    },
    startGame() {
        cc.director.loadScene('aircraft_war_game')
    },
    backList() {
        cc.director.loadScene('startscene')
    },
    loadingBgAction() {
        let act = cc.repeatForever(cc.sequence(cc.tintTo(.6, 202, 111, 111), cc.tintTo(.6, 206, 154, 114), cc.tintTo(.6, 206, 202, 114), cc.tintTo(.6, 118, 206, 114), cc.tintTo(.6, 114, 188, 206), cc.tintTo(.6, 114, 136, 206), cc.tintTo(.6, 185, 114, 206)));
        this.loadingBg.runAction(act)
    },
    //加载背景图片 wx cloud
    loadNoticePic(cb) {
        const self = this;
        if (Gdt.loopBg) {
            cc.loader.load(Gdt.loopBg, (err, texture) => {
                if (!err) {
                    this.loadingBg.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture)
                };
                wx.hideLoading()
            });
            return
        };
        const db = wx.cloud.database();
        db.collection('gameConfig').doc('XDWYPuSiwXKAQnli').get({
            success: (ret) => {
                let arr = [];
                arr.push(ret.data.loopbg);
                wx.cloud.getTempFileURL({
                    fileList: arr,
                    success: res => {
                        cc.loader.load(res.fileList[0].tempFileURL, (err, texture) => {
                            if (!err) {
                                Gdt.loopBg = texture;
                                this.loadingBg.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture)
                            };
                            wx.hideLoading()
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
