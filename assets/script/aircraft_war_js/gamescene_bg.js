const Gdt = require('globals');
cc.Class({
    extends: cc.Component,
    properties: {
        loopBg1: {
            default: null,
            type: cc.Node
        }
    },
    start() {
        if (Gdt.loopBg) this.loopBg1.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(Gdt.loopBg)
    }
})
