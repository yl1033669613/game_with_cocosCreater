const Gdt = require('globals');

cc.Class({
    extends: cc.Component,

    properties: {
        // 滚动的速度，单位px/s
        speed: -150,
        main: {
            default: null,
            type: require('main')
        }
    },
    onLoad() {
        this.resetY = -(this.node.parent.height / 2)
    },
    start() {
        if (Gdt.loopBg) {
            this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(Gdt.loopBg)
        }
    },
    update (dt) {
        if (this.main.curState != Gdt.commonInfo.gameState.start) {
            return;
        };
        this.node.y += this.speed * dt;
        if (this.node.y <= this.resetY) {
            this.node.y = this.node.parent.height / 2;
        }
    }
})
