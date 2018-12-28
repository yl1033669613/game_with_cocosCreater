cc.Class({
    extends: cc.Component,

    properties: {
        // 滚动的速度，单位px/s
        speed: -150,
        resetY: -750
    },
    update (dt) {
        this.node.y += this.speed * dt;
        if (this.node.y <= this.resetY) {
            this.node.y = 0;
        }
    }
})
