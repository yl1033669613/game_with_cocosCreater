const D = require('globals');

cc.Class({
    extends: cc.Component,
    properties: {
        xMinSpeed: 0,
        xMaxSpeed: 0,
        yMinSpeed: 0,
        yMaxSpeed: 0,
        initHP: 0,
        score: 0,
        enemyType: 1,
        enemyBulletFreq: 5,
        heroDropHp: 5,
        initSize: 30,
        buffType: 'none',
        nodeCollision: {
            default: null,
            type: cc.Node
        },
        texturePic: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.enemyGroup = this.node.parent.getComponent('enemy_group');
        this.enemyBulletGroup = cc.find('Canvas/background/enemyBulletGroup').getComponent('enemy_bullet_group');
        this.buffGroup = cc.find('Canvas/background/buffGroup').getComponent('buff_group')
    },
    onEnable() {
        if (this.enemyType != 1) {
            this.schedule(this.startGetEnemyBullet, this.enemyBulletFreq)
        }
    },
    startGetEnemyBullet() {
        this.enemyBulletGroup.enemyOpenFire(this.node)
    },
    init() {
        if (this.node.group != 'enemy') {
            this.node.group = 'enemy'
        };
        if (this.hP != this.initHP) {
            this.hP = this.initHP
        };
        this.texturePic.active = true;
        this.nodeCollision.group = 'enemy'; //恢复碰撞状态
    },
    update(dt) {
        if (this.enemyGroup.eState != D.commonInfo.gameState.start) {
            return;
        };
        if (this.hP == 0) return;
        let scores = this.enemyGroup.getScore();
        if (this.enemyType == 1) {
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
                this.node.y += dt * this.ySpeed - 2.5;
            }
        } else {
            this.node.y += dt * this.ySpeed;
        };
        this.node.x += dt * this.xSpeed;
        //出屏幕后 回收节点
        if (this.node.y < -this.node.parent.height / 2 - this.node.height / 2) {
            this.enemyGroup.enemyDied(this.node, 0);
            if (this.enemyType != 1) {
                this.unschedule(this.startGetEnemyBullet)
            }
        }
    },
    //节点回收
    enemyOver(isHero) {
        let score = 0,
            anim = this.node.getComponent(cc.Animation),
            animName = 'blow_up';
        if (isHero != 'isHero') {
            score = this.score
        };
        if (this.enemyType != 1) {
            this.unschedule(this.startGetEnemyBullet)
        };
        this.texturePic.active = false;
        this.buffGroup.createHeroBuff(this.node);
        anim.play(animName);
        anim.on('finished', function() {
            this.node.getComponent(cc.Sprite).spriteFrame = null;
            this.node.width = this.initSize;
            this.node.height = this.initSize;
            this.enemyGroup.enemyDied(this.node, score)
        }, this)
    }
})
