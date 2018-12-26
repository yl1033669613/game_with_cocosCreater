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
            type: cc.SpriteFrame
        },
        nodeCollision: {
            default: null,
            type: cc.Node
        },
        score: 0 //死后获得的分数
    },
    onLoad() {
        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.enemyGroup = this.node.parent.getComponent('enemy_group');
    },
    init() {
        if (this.node.group != 'enemy') {
            this.node.group = 'enemy';
        };
        if (this.hP != this.initHP) {
            this.hP = this.initHP;
        };
        let nSprite = this.node.getComponent(cc.Sprite);
        if (nSprite.spriteFrame != this.initSpriteFrame) {
            nSprite.spriteFrame = this.initSpriteFrame;
        };
        this.nodeCollision.group = 'enemy'; //恢复碰撞状态
    },
    update(dt) {
        if (this.enemyGroup.eState != D.commonInfo.gameState.start) {
            return;
        };
        if (this.hP == 0) return;
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
    //动画结束后 动画节点回收
    enemyOver(isHero) {
        let score = 0,
            anim = this.node.getComponent(cc.Animation),
            animName = this.node.name + 'Ani';
        if (isHero != 'isHero') {
            score = this.score
        };
        anim.play(animName);
        anim.on('finished', function(){
            this.enemyGroup.enemyDied(this.node, score);
        },this)
    }
})
