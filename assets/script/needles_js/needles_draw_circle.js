cc.Class({
    extends: cc.Component,

    properties: {
        r: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.ctx = this.node.getComponent(cc.Graphics);
    },

    start(){
        this.ctx.circle(this.r, this.r, this.r);
        this.ctx.fill();
    }
});
