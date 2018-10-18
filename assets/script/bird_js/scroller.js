cc.Class({
    extends: cc.Component,

    properties: {
        // 滚动的速度，单位px/s
        speed: -300,
        // x到达此位置后开始重头滚动
        resetX: -300
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.canScroll = true;
    },

    start() {

    },

    update(dt) {
        if (!this.canScroll) {
            return;
        }
        this.node.x += this.speed * dt;
        if (this.node.x <= this.resetX) {
            this.node.x -= this.resetX;
        }
    },

    stopScroll() {
        this.canScroll = false;
    },

    startScroll() {
        this.canScroll = true;
    }
});
