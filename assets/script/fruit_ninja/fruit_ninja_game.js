const Utils = require('../utils.js');

let lifeG = cc.Class({
    name: 'lifeG',
    properties: {
        index: 0,
        lifeConsume: {
            default: null,
            type: cc.Node
        }
    }
});

cc.Class({
    extends: cc.Component,
    properties: {
        knife: {
            default: null,
            type: cc.Node
        },
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        lifeG: {
            default: [],
            type: lifeG
        },
        fruitGroup: {
            default: null,
            type: require('fruit_ninja_group')
        },
        gameOverMask: {
            default: null,
            type: cc.Node
        },
        bestScoreLabel: {
            default: null,
            type: cc.Label
        }
    },
    onLoad() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        const physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        physicsManager.debugDrawFlags = 0;
        this.knifeMotionS = this.knife.getComponent(cc.MotionStreak);
    },
    start() {
        this.knifeMove();
        this.init();
    },
    init() {
        this.gameOver = false;
        this.score = 0;
        this.bestScore = Utils.GD.userGameInfo.fruitNinjaBestScore || 0;
        this.life = 0;
        this.lifeG.forEach((a) => {
            a.lifeConsume.active = false;
        });
        this.upDateUi();
        this.fruitGroup.createFruitList();
    },
    knifeMove() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.startEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.moveEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.endEvent, this);
    },
    startEvent(e) {
        let pos = this.node.convertToNodeSpaceAR(new cc.Vec2(e.getLocation()));
        this.knife.setPosition(pos);
        this.knife.group = 'knife';
        this.knifeMotionS.reset();
    },
    moveEvent(e) {
        let pos = this.node.convertToNodeSpaceAR(new cc.Vec2(e.getLocation()));
        this.knife.setPosition(pos);
    },
    endEvent(e) {
        this.knife.group = 'default';
    },
    updateScore(type, score) {
        if (this.gameOver) return;
        if (type) {
            this.score += score;
        } else {
            if (this.score == 0) {
                this.lifeConsume();
            };
            this.score = this.score < (score * 2) ? 0 : this.score - (score * 2);
        };
        this.upDateUi();
    },
    lifeConsume() {
        this.life++;
        if (this.life == 3) this.gameOverHandle();
    },
    upDateUi() {
        this.scoreLabel.string = this.score;
        for (let i = 0; i < this.life; i++) {
            this.lifeG[i].lifeConsume.active = true;
        }
    },
    gameOverHandle() {
        this.gameOver = true;
        this.knife.group = 'default';
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreLabel.string = 'Best score: ' + this.bestScore;
            this.updateBestScore();
        };
        this.scheduleOnce(() => {
            this.showTheGameOverMask(true);
        }, .5, this);
    },
    backStart() {
        cc.director.loadScene('fruit_ninja_start');
    },
    restartGame() {
        this.showTheGameOverMask(false);
        this.init();
    },
    showTheGameOverMask(bool) {
        if (bool) {
            this.gameOverMask.active = true;
            this.gameOverMask.opacity = 0;
            this.gameOverMask.runAction(cc.sequence(cc.scaleTo(0, 0.9, 0.9), cc.spawn(cc.scaleTo(0.4, 1, 1), cc.fadeIn(0.4))));
        } else {
            this.gameOverMask.runAction(cc.sequence(cc.fadeOut(0.4), cc.callFunc(() => {
                this.gameOverMask.active = false;
            }, this)))
        }
    },
    updateBestScore() {
        const self = this;
        Utils.GD.updateGameScore({
            fruitNinjaBestScore: self.bestScore
        }, () => {
            Utils.GD.setUserGameInfo('fruitNinjaBestScore', self.bestScore);
            console.log('保存成功');
        })
    }
});