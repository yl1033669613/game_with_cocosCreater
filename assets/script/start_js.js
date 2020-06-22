const SCENESLIST = [{
    title: ' Aircraft war',
    name: 'aircraft_war_start'
}, {
    title: ' Fruit Ninja',
    name: 'fruit_ninja_start'
}, {
    title: ' Don\'t touch white block',
    name: 'dontt_white_block_start'
}, {
    title: ' Flappy bird',
    name: 'flappy_bird'
}, {
    title: ' Skyscraper',
    name: 'skyscraper_start'
}, {
    title: ' Needles',
    name: 'game_needles_start'
}, {
    title: ' Snake',
    name: 'snake'
}, {
    title: ' 2048',
    name: 'game2048'
}, {
    title: ' Tetris',
    name: 'tetris'
}, {
    title: ' Follow the circle',
    name: 'follow_the_circle'
}, {
    title: ' Firework',
    name: 'firework'
}];

const Utils = require('./utils.js');

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
        },
        loadMask: {
            default: null,
            type: cc.Node
        },
        progress: {
            default: null,
            type: cc.ProgressBar
        },
        text: {
            default: null,
            type: cc.Label
        }
    },
    onLoad() {
        this.isNav = false
        this.noticeOpen = false;
        this.noticeLoadFirst = true;
        let y = -65;
        for (let i = 0; i < SCENESLIST.length; i++) {
            let btn = cc.instantiate(this.gameBtnPfb); // 创建节点
            let item = btn.getComponent('game_start_btn');
            this.content.addChild(btn);
            if (i > 0) y -= 65;
            item.updateItem(i, y, SCENESLIST[i].title, SCENESLIST[i].name);
        };
        this.content.height = Math.abs(y) + 55;
    },
    openNotice() {
        const self = this;
        let dt = 120;
        if (!self.noticeOpen) {
            self.noticeOpen = true;
            dt = 120;
        } else {
            self.noticeOpen = false;
            dt = -120;
        };
        if (self.noticeOpen && self.noticeLoadFirst) {
            Utils.GD.showWxLoading(true);
            self.loadNoticePic(() => { //请求notice pic
                self.noticeMoveAction(dt)
            });
        } else {
            self.noticeMoveAction(dt);
        }
    },
    noticeMoveAction(dt) {
        cc.tween(this.bottBanner).by(.6, {position: cc.v2(0, dt)}, {easing: 'bounceOut'} ).start();
    },
    //加载notice wx cloud
    loadNoticePic(cb) {
        const self = this;
        const sprite = self.noticePic.getComponent(cc.Sprite);
        Utils.GD.getIndexNoticePic(res => {
            Utils.GD.showWxLoading(false);
            if (res) {
                self.noticeLoadFirst = false;
                cc.loader.load(res.fileList[0].tempFileURL, (err, texture) => {
                    if (texture) {
                        sprite.spriteFrame = new cc.SpriteFrame(texture);
                        self.noticePic.parent.height = self.noticePic.height;
                    }
                })
            };
            cb && cb();
        })
    },
    // 预加载完成时切换场景
    loadGames(url) {
        const self = this
        if (!self.isNav) {
            self.isNav = true
            self.text.string = '0' + '%';
            self.progress.progress = 0;
            self.loadMask.opacity = 0;
            self.loadMask.active = true;
            cc.tween(self.loadMask).by(.2, { opacity: 250 }).call(() => {
                // 预加载，第一个是场景名，第二个callback中3个参数，第三个callback是完成回调
                cc.director.preloadScene(url, (completedCount, totalCount, item) => {
                    let p = completedCount / totalCount;
                    self.progress.progress = p;
                    self.text.string = parseInt(p * 100) + '%';
                }, () => {
                    cc.tween(self.loadMask).to(.3, { opacity: 50 }).call(() => {
                        self.isNav = false
                        self.loadMask.active = false;
                        cc.director.loadScene(url);
                    }).start()
                })
            }).start()
        }
    }
})