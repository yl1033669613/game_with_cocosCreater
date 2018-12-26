const D = require('globals');

cc.Class({
    extends: cc.Component,
    properties: {
        pause: cc.Button,
        btnSprite: {
            default: [],
            type: cc.SpriteFrame
        },
        bomb: {
            default: null,
            type: cc.Node
        },
        hero: {
            default: null,
            type: require('hero'),
        },
        enemyGroup: {
            default: null,
            type: require('enemy_group'),
        },
        buffGroup: {
            default: null,
            type: require('buff_group'),
        },
        bulletGroup: {
            default: null,
            type: require('bullet_group'),
        },
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        bombNoDisplay: {
            default: null,
            type: cc.Label
        },
    },
    onLoad() {
        this.score = 0;
        this.bombNo = 0;
        this.isGameOver = false;
        this.scoreDisplay.string = this.score;
        this.bombNoDisplay.string = this.bombNo;
        this.eState = D.commonInfo.gameState.start;

        this.bulletGroup.startAction();
        this.enemyGroup.startAction();
        this.buffGroup.startAction();
        this.bomb.on(cc.Node.EventType.TOUCH_START, this.bombOnclick, this);
    },
    bombOnclick() {
        if (this.isGameOver) return;
        let bombNoLabel = this.bomb.getChildByName('bombNo').getComponent(cc.Label);
        let bombNo = parseInt(bombNoLabel.string);
        if (bombNo > 0) {
            bombNoLabel.string = bombNo - 1;
            this.removeAllEnemy();
        }
    },
    pauseClick() {
        if (!this.isGameOver) {
            if (this.eState == D.commonInfo.gameState.pause) {
                this.resumeAction();
                this.eState = D.commonInfo.gameState.start;
            } else if (this.eState == D.commonInfo.gameState.start) {
                this.pauseAction();
                this.eState = D.commonInfo.gameState.pause;
            }
        }
    },
    //游戏继续
    resumeAction() {
        this.enemyGroup.resumeAction();
        this.bulletGroup.resumeAction();
        this.buffGroup.resumeAction();
        this.hero.onDrag();
        this.pause.normalSprite = this.btnSprite[0];
        this.pause.pressedSprite = this.btnSprite[1];
        this.pause.hoverSprite = this.btnSprite[1];
    },
    //游戏暂停
    pauseAction() {
        this.enemyGroup.pauseAction();
        this.bulletGroup.pauseAction();
        this.hero.offDrag();
        this.buffGroup.pauseAction();
        this.pause.normalSprite = this.btnSprite[2];
        this.pause.pressedSprite = this.btnSprite[3];
        this.pause.hoverSprite = this.btnSprite[3]
    },
    //增加分数
    gainScore(scoreno) {
        this.score += scoreno;
        this.scoreDisplay.string = this.score.toString();
    },
    //get分数
    getScore() {
        return parseInt(this.scoreDisplay.string);
    },
    updateScore() {
        let currentScore = this.scoreDisplay.string;
    },
    //炸弹清除敌机
    removeAllEnemy() {
        let children = this.enemyGroup.node.children;
        for (let i = 0; i < children.length; i++) {
            children[i].getComponent('enemy').hP = 0;
            children[i].getComponent('enemy').enemyOver()
        }
    },
    //接到炸弹
    getBuffBomb() {
        if (parseInt(this.bombNoDisplay.string) < 3) { //多于三个炸弹就不累加
            this.bombNoDisplay.string += 1;
        }
    },
    //游戏结束
    gameOver() {
        this.isGameOver = true;
        this.pauseAction();
        this.updateScore()
    }
})
