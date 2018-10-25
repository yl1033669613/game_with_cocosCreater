cc.Class({
    extends: cc.Component,

    properties: {
        canvas: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
    },

    onCollisionEnter: function (other) {
        this.canvas.getComponent('needles_main').gameOver();
    }
});
