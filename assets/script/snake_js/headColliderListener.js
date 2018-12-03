cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;

        // Game Obj
        this.game = cc.find("Canvas").getComponent("snake_game");
    },

    onCollisionEnter: function (other) {
        this.game.gameOver = true;
    },

    start () {

    },
});
