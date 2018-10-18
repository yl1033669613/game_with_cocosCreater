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
