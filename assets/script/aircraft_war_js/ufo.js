const D = require('globals');

cc.Class({
    extends: cc.Component,
    properties: {
        xMinSpeed: 0,
        xMaxSpeed: 0,
        yMinSpeed: 0,
        yMaxSpeed: 0
    },
    onLoad: function() {
        cc.director.getCollisionManager().enabled = true;
        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.ufoGroup = this.node.parent.getComponent('ufoGroup');
    },
    onCollisionEnter: function(other, self) {
        this.node.destroy();
    },
    update: function(dt) {
        if (this.ufoGroup.eState != D.commonInfo.gameState.start) {
            return;
        }
        this.node.x += dt * this.xSpeed;
        this.node.y += dt * this.ySpeed;
        //出屏幕后
        if (this.node.y < -this.node.parent.height / 2) {
            this.ufoGroup.ufoDied(this.node);
        }
    }
})
