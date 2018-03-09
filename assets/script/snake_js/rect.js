// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.ctx = this.node.getComponent(cc.Graphics);
        this.drawRect();
    },

    drawRect() {
        this.ctx.clear();
        this.ctx.rect(0, 0, this.node.width, this.node.height);
        this.ctx.fill();
        this.ctx.stroke();
    },

    update(dt) {
        this.drawRect();
    }
});
