const D = require('globals');

cc.Class({
    extends: cc.Component,

    properties: () => ({
        moveRatio: 0.8,
        heroHp: 10,
        main: {
            default: null,
            type: require('main'),
        },
        bulletGroup: {
            default: null,
            type: require('bullet_group'),
        },
        heroHpLabel: {
            default: null,
            type: cc.Label
        },
        heroDropHpBg: {
            default: null,
            type: cc.Node
        }
    }),

    onLoad() {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.eState = D.commonInfo.gameState.none;
        this.currX = 0;
        this.onDrag();
        //setting hero pos
        this.node.x = 0;
        this.node.y = -(this.node.parent.height / 2) + (this.node.height / 2) + 8;

        this.heroHpLabel.string = this.heroHp
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
        location.x += (locationv.x - this.currX) * this.moveRatio;
        this.currX = locationv.x;
        if (location.x < minX) {
            location.x = minX;
        };
        if (location.x > maxX) {
            location.x = maxX;
        };
        this.node.setPosition(location);
    },
    heroHitByEnemyShowBlood() {
        this.heroDropHpBg.active = true;
        let act = cc.sequence(cc.fadeTo(0, 0), cc.fadeTo(.3, 100), cc.callFunc(() => {
            this.heroDropHpBg.active = false;
        }, this));
        this.heroDropHpBg.runAction(act)
    },
    //碰撞监测
    onCollisionEnter(other, self) {
        if (other.node.group == 'buff') {
            if (other.node.name == 'buffBullet') {
                this.bulletGroup.changeBullet(other.node.name)
            } else if (other.node.name == 'buffBomb') {
                this.main.getBuffBomb()
            }
        } else if (other.node.group == 'enemy') {
            let enemy = other.node.parent.getComponent('enemy');
            this.heroHp -= enemy.heroDropHp;
            other.node.group = 'default'; //防止敌人死亡之后再次发生碰撞
            if (this.heroHp > 0) {
                this.heroHitByEnemyShowBlood()
            }
        } else if (other.node.group == 'enemyBullet') {
            let enemyBullet = other.node.getComponent('enemy_bullet');
            this.heroHp -= enemyBullet.hpDrop;
            if (this.heroHp > 0) {
                this.heroHitByEnemyShowBlood()
            }
        } else {
            return false;
        };
        //hp 小于0 gameOver播放动画
        this.heroHpLabel.string = this.heroHp > 0 ? this.heroHp : 0;
        if (this.heroHp <= 0) {
            let animation = this.node.getComponent(cc.Animation);
            animation.play('blow_up');
            animation.on('finished', this.onFinished, this);
            this.main.gameOver()
        }
    },
    onFinished(event) { //动画结束后
        this.node.destroy();
    }
})
