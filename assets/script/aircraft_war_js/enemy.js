const Gdt = require('globals');

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
        },
        ptcSys1: {
            default: null,
            type: cc.ParticleSystem
        },
        ptcSys2: {
            default: null,
            type: cc.ParticleSystem
        }
    },
    onLoad() {
        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        if (this.xMaxSpeed && Math.ceil(Math.random() * 10) < 5) this.xSpeed = -this.xSpeed;
        this.ySpeed = Math.random() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.enemyGroup = this.node.parent.getComponent('enemy_group');
        this.enemyBulletGroup = cc.find('Canvas/background/enemyBulletGroup').getComponent('enemy_bullet_group');
        this.buffGroup = cc.find('Canvas/background/buffGroup').getComponent('buff_group');
    },
    onEnable() {
        if (this.enemyType != 1) {
            this.getBulletCb = function(e) {
                this.enemyBulletGroup.enemyOpenFire(this.node)
            }.bind(this);
            this.schedule(this.getBulletCb, this.enemyBulletFreq)
        }
    },
    init() {
        if (this.node.group != 'enemy') this.node.group = 'enemy';
        if (this.hP != this.initHP) this.hP = this.initHP;
        this.texturePic.active = true;
        this.nodeCollision.group = 'enemy'; //恢复碰撞状态
        if (this.ptcSys1 && this.ptcSys2) { //恢复粒子
            this.ptcSys1.resetSystem();
            this.ptcSys2.resetSystem();
        }
    },
    update(dt) {
        if (this.enemyGroup.curState != Gdt.commonInfo.gameState.start) return;
        if (this.hP == 0) return;
        let ndX = this.node.x;
        ndX += dt * this.xSpeed;
        if (ndX <= -(this.node.parent.width - this.node.width) / 2) {
            ndX = (this.node.parent.width - this.node.width) / 2;
            this.xSpeed = -this.xSpeed;
        } else if (ndX >= (this.node.parent.width - this.node.width) / 2) {
            ndX = (this.node.parent.width - this.node.width) / 2;
            this.xSpeed = -this.xSpeed;
        } else {
            this.node.x = ndX;
        };
        let scores = this.enemyGroup.getScore();
        if (this.enemyType == 1) {
            if (scores <= 500000) {
                this.node.y += dt * this.ySpeed;
            } else if (scores > 500000 && scores <= 1000000) {
                this.node.y += dt * this.ySpeed - 0.5;
            } else if (scores > 1000000 && scores <= 2000000) {
                this.node.y += dt * this.ySpeed - 1;
            } else if (scores > 2000000 && scores <= 3000000) {
                this.node.y += dt * this.ySpeed - 1.5;
            } else if (scores > 3000000 && scores <= 4000000) {
                this.node.y += dt * this.ySpeed - 2;
            } else {
                this.node.y += dt * this.ySpeed - 2.5;
            };
        } else {
            this.node.y += dt * this.ySpeed;
        };
        //出屏幕后 回收节点
        if (this.node.y < -this.node.parent.height / 2 - this.node.height / 2) {
            this.enemyGroup.enemyDied(this.node, 0);
            if (this.enemyType != 1) this.unschedule(this.getBulletCb);
        }
    },
    //节点回收
    enemyOver(isHero) {
        let score = 0,
            anim = this.node.getComponent(cc.Animation),
            animName = 'blow_up';
        if (isHero != 'isHero') score = this.score;
        if (this.enemyType != 1) this.unschedule(this.getBulletCb);
        this.texturePic.active = false;
        this.buffGroup.createHeroBuff(this.node);
        if (this.ptcSys1 && this.ptcSys2) {
            this.ptcSys1.stopSystem();
            this.ptcSys2.stopSystem();
        };
        anim.play(animName);
        anim.on('finished', function() {
            this.node.getComponent(cc.Sprite).spriteFrame = null;
            this.node.width = this.initSize;
            this.node.height = this.initSize;
            this.enemyGroup.enemyDied(this.node, score);
        }, this)
    }
})
