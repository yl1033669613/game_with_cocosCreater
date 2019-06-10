cc.Class({
    extends: cc.Component,
    properties: {
        r: 0
    },
    onLoad () {
        this.ctx = this.node.getComponent(cc.Graphics);
    },
    start(){
        this.ctx.circle(0, 0, this.r);
        this.ctx.fill();
    }
})
