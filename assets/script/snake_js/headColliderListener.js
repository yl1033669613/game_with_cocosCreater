cc.Class({
    extends: cc.Component,
    properties: {
        
    },
    onLoad () {
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
        // Game Obj
        this.game = cc.find("Canvas").getComponent("snake_game");
    },
    onCollisionEnter (other, self) {
        this.game.gameOver = true;
    }
})
