cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
    },

    onCollisionEnter: function (other) {
        let canvas = this.node.parent.parent.parent;
        canvas.getComponent('needles_main').gameOver();
    }
});
