const D = require('globals');

cc.Class({
    extends: cc.Component,
    properties: {
        xSpeed: 0, //x轴速度
        ySpeed: 0, //y轴速度
        hpDrop: 0 //掉血
    },
    onLoad() {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.bulletGroup = this.node.parent.getComponent('bullet_group')
    },
    //碰撞检测
    onCollisionEnter(other, self) {
        this.bulletGroup.bulletDied(self.node);
    },
    update(dt) {
        if (this.bulletGroup.eState != D.commonInfo.gameState.start) {
            return
        };
        this.node.x += dt * this.xSpeed;
        this.node.y += dt * this.ySpeed;
        if (this.node.y > this.node.parent.height / 2) {
            this.bulletGroup.bulletDied(this.node)
        }
    }
})
