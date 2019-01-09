const Gdt = require('globals');

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
        if (Math.ceil(Math.random()*10) < 5) {
            this.xSpeed = - this.xSpeed
        };
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.buffGroup = this.node.parent.getComponent('buff_group');
    },
    onCollisionEnter(other, self) {
        this.buffGroup.buffDied(self.node);
    },
    update(dt) {
        if (this.buffGroup.curState != Gdt.commonInfo.gameState.start) {
            return;
        };
        let ndX = this.node.x,
            ndY = this.node.y;
        ndX += dt * this.xSpeed;
        ndY += dt * this.ySpeed;
        if (ndX <= -(this.node.parent.width - this.node.width) / 2) {
            ndX = (this.node.parent.width - this.node.width) / 2;
            this.xSpeed = -this.xSpeed;
        } else if (ndX >= (this.node.parent.width - this.node.width) / 2) {
            ndX = (this.node.parent.width - this.node.width) / 2;
            this.xSpeed = -this.xSpeed;
        } else {
            this.node.x = ndX;
        };
        this.node.y = ndY;
        if (this.node.y < -this.node.parent.height / 2 - this.node.height / 2) {
            this.buffGroup.buffDied(this.node);
        }
    }
})
