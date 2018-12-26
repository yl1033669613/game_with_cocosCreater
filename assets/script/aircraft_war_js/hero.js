const D = require('globals');

cc.Class({
    extends: cc.Component,

    properties: () => ({
        main: {
            default: null,
            type: require('main'),
        },
        bulletGroup: {
            default: null,
            type: require('bullet_group'),
        }
    }),

    onLoad() {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.eState = D.commonInfo.gameState.none;
        this.currX = 0;
        this.onDrag()
    },
    onDrag() {
        this.node.parent.on(cc.Node.EventType.TOUCH_START, this.dragStart, this);
        this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, this.dragMove, this);
    },
    offDrag() {
        this.node.parent.off(cc.Node.EventType.TOUCH_START, this.dragStart, this);
        this.node.parent.off(cc.Node.EventType.TOUCH_MOVE, this.dragMove, this);
    },
    dragStart(event) {
        let locationv = event.getLocation();
        this.currX = locationv.x;
    },
    dragMove(event) {
        let locationv = event.getLocation(),
            location = { x: this.node.x, y: this.node.y },
            minX = -this.node.parent.width / 2 + this.node.width / 2,
            maxX = -minX;
        location.x += locationv.x - this.currX;
        this.currX = locationv.x;
        if (location.x < minX) {
            location.x = minX;
        };
        if (location.x > maxX) {
            location.x = maxX;
        };
        this.node.setPosition(location);
    },
    //碰撞监测
    onCollisionEnter(other, self) {
        if (other.node.group == 'buff') {
            if (other.node.name == 'buffBullet') {
                this.bulletGroup.changeBullet(other.node.name);
            } else if (other.node.name == 'buffBomb') {
                this.main.getBuffBomb();
            }
        } else if (other.node.group == 'enemy') {
            //播放动画
            let animation = this.node.getComponent(cc.Animation);
            animation.play('hero_bomb_ani');
            animation.on('finished', this.onFinished, this);
            this.main.gameOver();
        } else {
            return false;
        }
    },
    onFinished(event) { //动画结束后
        this.node.destroy();
    }
})
