const D = require('globals');

cc.Class({
    extends: cc.Component,
    properties: {
        pause: cc.Button,
        btnSprite: {
            default: [],
            type: cc.SpriteFrame,
            tooltip: '暂停按钮不同状态的图片',
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
            type: require('enemyGroup'),
        },
        ufoGroup: {
            default: null,
            type: require('ufoGroup'),
        },
        bulletGroup: {
            default: null,
            type: require('bulletGroup'),
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
        this.scoreDisplay.string = this.score;
        this.bombNoDisplay.string = this.bombNo;
        this.eState = D.commonInfo.gameState.start;

        this.bulletGroup.startAction();
        this.enemyGroup.startAction();
        this.ufoGroup.startAction();
        this.bomb.on(cc.Node.EventType.TOUCH_START, this.bombOnclick, this);
    },

    bombOnclick() {
        let bombNoLabel = this.bomb.getChildByName('bombNo').getComponent(cc.Label);
        let bombNo = parseInt(bombNoLabel.string);
        if (bombNo > 0) {
            bombNoLabel.string = bombNo - 1;
            this.removeEnemy();
        }
    },
    //暂停按钮点击事件  
    pauseClick() { //暂停 继续
        if (this.eState == D.commonInfo.gameState.pause) {
            this.resumeAction();
            this.eState = D.commonInfo.gameState.start;
        } else if (this.eState == D.commonInfo.gameState.start) {
            this.pauseAction();
            this.eState = D.commonInfo.gameState.pause;
        }
    },
    //游戏继续
    resumeAction() {
        this.enemyGroup.resumeAction();
        this.bulletGroup.resumeAction();
        this.ufoGroup.resumeAction();
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
        this.ufoGroup.pauseAction();
        this.pause.normalSprite = this.btnSprite[2];
        this.pause.pressedSprite = this.btnSprite[3];
        this.pause.hoverSprite = this.btnSprite[3];

    },
    //增加分数
    gainScore(scoreno) {
        this.score += scoreno;
        //更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = this.score.toString();
    },
    //get分数
    getScore() {
        return parseInt(this.scoreDisplay.string);
    },
    updateScore() {
        let currentScore = this.scoreDisplay.string;
        let scoreData = {
            'score': currentScore,
            'time': D.common.timeFmt(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        };
        let preData = cc.sys.localStorage.getItem('score');
        let preTopScore = cc.sys.localStorage.getItem('topScore');
        if (!preTopScore || parseInt(preTopScore) < parseInt(currentScore)) {
            cc.sys.localStorage.setItem('topScore', currentScore);
        }
        if (!preData) {
            preData = [];
            preData.unshift(scoreData);
        } else {
            preData = JSON.parse(preData);
            if (!(preData instanceof Array)) {
                preData = [];
            }
            preData.unshift(scoreData);
        }
        cc.sys.localStorage.setItem('currentScore', currentScore);
        cc.sys.localStorage.setItem('score', JSON.stringify(preData));
    },
    //炸弹清除敌机
    removeEnemy() {
        this.enemyGroup.node.removeAllChildren();
    },
    //接到炸弹
    getUfoBomb() {
        if (parseInt(this.bombNoDisplay.string) < 3) { //多于三个炸弹就不累加
            this.bombNoDisplay.string += 1;
        }
    },
    //游戏结束
    gameOver() {
        this.pauseAction();
        this.updateScore();
        cc.director.loadScene('end');
    },
});
