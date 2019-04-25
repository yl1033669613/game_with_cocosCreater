cc.Class({
    extends: cc.Component,
    properties: {
        // 滚动的速度，单位px/s
        speed: -300,
        canvasNode: {
            default: null,
            type: cc.Node
        },
        longGround: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        this.canScroll = true;
        this.resetX = -300;
    },
    start() {
        this.resetX = -(this.canvasNode.width - 100);
        this.longGround.width = this.canvasNode.width;
        this.longGround.x = this.canvasNode.width;
    },
    update(dt) {
        if (!this.canScroll) return;
        this.node.x += this.speed * dt;
        if (this.node.x <= this.resetX) this.node.x -= this.resetX
    },
    stopScroll() {
        this.canScroll = false;
    },
    startScroll() {
        this.canScroll = true;
    }
})
