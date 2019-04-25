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
    title: ' Firework',
    name: 'firework'
}, {
    title: ' Follow the circle',
    name: 'follow_the_circle'
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
        }
    },
    onLoad() {
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
        let moveAction = cc.moveBy(.6, 0, dt).easing(cc.easeBounceOut(.6));
        this.bottBanner.runAction(moveAction);
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
    }
})