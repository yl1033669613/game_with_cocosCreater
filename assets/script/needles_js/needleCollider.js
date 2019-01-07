cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
    },

    onCollisionEnter: function (other, self) {
        let canvas = self.node.parent.parent.parent;
        canvas.getComponent('needles_main').gameOver();
    }
});
