const D = require('globals');

cc.Class({
    extends: cc.Component,
    properties: {
        xMinSpeed: 0,
        xMaxSpeed: 0,
        yMinSpeed: 0,
        yMaxSpeed: 0
    },
    onLoad() {
        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.buffGroup = this.node.parent.getComponent('buff_group');
    },
    onCollisionEnter(other, self) {
        this.buffGroup.buffDied(self.node);
    },
    update(dt) {
        if (this.buffGroup.eState != D.commonInfo.gameState.start) {
            return;
        };
        this.node.x += dt * this.xSpeed;
        this.node.y += dt * this.ySpeed;
        if (this.node.y < -this.node.parent.height / 2) {
            this.buffGroup.buffDied(this.node);
        }
    }
})
