const Gdt = require('globals');

cc.Class({
    extends: cc.Component,

    properties: {
        // 滚动的速度，单位px/s
        speed: -150,
        main: {
            default: null,
            type: require('main')
        },
        loopBg1: {
            default: null,
            type: cc.Node
        },
        loopBg2: {
            default: null,
            type: cc.Node
        }
    },
    start() {
        this.loopBg1.y = 0;
        this.loopBg2.y = this.node.parent.height;
        if (Gdt.loopBg) {
            this.loopBg1.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(Gdt.loopBg);
            this.loopBg2.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(Gdt.loopBg)
        }
    },
    bgMove(dt) {
        this.loopBg1.y += this.speed * dt;
        if (this.loopBg1.y < -this.node.parent.height) {
            this.loopBg1.y = this.node.parent.height - 5;
        };
        this.loopBg2.y += this.speed * dt;
        if (this.loopBg2.y < -this.node.parent.height) {
            this.loopBg2.y = this.node.parent.height - 5;
        }
    },
    update(dt) {
        if (this.main.curState == Gdt.commonInfo.gameState.start) {
            this.bgMove(dt)
        }
    }
})
