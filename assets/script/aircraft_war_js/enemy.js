const D = require('globals');

cc.Class({
    extends: cc.Component,

    properties: {
        xMinSpeed: 0, //x轴最小速度
        xMaxSpeed: 0, //x轴最大速度
        yMinSpeed: 0, //y轴最小速度
        yMaxSpeed: 0, //y轴最大速度
        initHP: 0, //初始生命值
        initSpriteFrame: {
            default: null,
            type: cc.SpriteFrame,
            tooltip: '初始化的图像'
        },
        score: 0 //死后获得的分数
    },
    onLoad() {
        cc.director.getCollisionManager().enabled = true;

        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.enemyGroup = this.node.parent.getComponent('enemyGroup');
    },
    init() {
        if (this.node.group != 'enemy') {
            this.node.group = 'enemy';
        }
        if (this.hP != this.initHP) {
            this.hP = this.initHP;
        }
        let nSprite = this.node.getComponent(cc.Sprite);
        if (nSprite.spriteFrame != this.initSpriteFrame) {
            nSprite.spriteFrame = this.initSpriteFrame;
        }
    },
    update(dt) {
        if (this.enemyGroup.eState != D.commonInfo.gameState.start) {
            return;
        }
        let scores = this.enemyGroup.getScore();
        if (scores <= 50000) {
            this.node.y += dt * this.ySpeed;
        } else if (scores > 50000 && scores <= 100000) {
            this.node.y += dt * this.ySpeed - 0.5;
        } else if (scores > 100000 && scores <= 150000) {
            this.node.y += dt * this.ySpeed - 1;
        } else if (scores > 150000 && scores <= 200000) {
            this.node.y += dt * this.ySpeed - 1.5;
        } else if (scores > 200000 && scores <= 300000) {
            this.node.y += dt * this.ySpeed - 2;
        } else {
            this.node.y += dt * this.ySpeed - 3;
        }
        this.node.x += dt * this.xSpeed;
        //出屏幕后 回收节点
        if (this.node.y < -this.node.parent.height / 2 - this.node.height / 2 ) {
            this.enemyGroup.enemyDied(this.node, 0);
        }
    },
    //碰撞检测
    onCollisionEnter(other, self) {
        if (other.node.group != 'bullet') {
            return;
        }
        let bullet = other.node.getComponent('bullet');

        if (this.hP > 0) {
            this.hP -= bullet.hpDrop;
        } else {
            return;
        }
        if (this.hP <= 0) {
            this.node.group = 'default'; //不让动画在执行碰撞
            //播放动画
            let anim = this.getComponent(cc.Animation);
            let animName = self.node.name + 'ani';
            anim.play(animName);
            anim.on('finished', this.onFinished, this);
        }
    },
    //动画结束后 动画节点回收
    onFinished(event) {
        this.enemyGroup.enemyDied(this.node, this.score);
    }
})
