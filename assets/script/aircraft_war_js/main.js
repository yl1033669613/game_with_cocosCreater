const Gdt = require('globals');
cc.Class({
    extends: cc.Component,
    properties: {
        pause: {
            default: null,
            type: cc.Button
        },
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
        enemyBulletGroup: {
            default: null,
            type: require('enemy_bullet_group'),
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
        gameOverMask: {
            default: null,
            type: cc.Node
        },
        maskBestScore: {
            default: null,
            type: cc.Label
        },
        maskCurrScore: {
            default: null,
            type: cc.Label
        }
    },
    onLoad() {
        this.score = 0;
        this.bombNo = 0;
        this.isGameOver = false;
        this.scoreDisplay.string = this.score;
        this.bombNoDisplay.string = this.bombNo;
        this.curState = Gdt.commonInfo.gameState.start;
        // wx cloud
        this.globalUser = cc.director.getScene().getChildByName('gameUser').getComponent('game_user_js');
        this.db = wx.cloud.database();
        this.bestScore = this.globalUser.userGameInfo.aircraftWarBestScore || 0;
        this.maskBestScore.string = 'Best Score: ' + this.bestScore;
        //判断数据库字段 不存在则先更新字段
        if (typeof this.globalUser.userGameInfo.aircraftWarBestScore != 'number') {
            this.requestDbAircraftWarScore()
        };

        this.bulletGroup.startAction();
        this.enemyGroup.startAction();
        this.bomb.on(cc.Node.EventType.TOUCH_START, this.bombOnclick, this);
    },
    bombOnclick() {
        if (this.isGameOver) return;
        let bombNoLabel = this.bombNoDisplay;
        let bombNo = parseInt(bombNoLabel.string);
        if (bombNo > 0) {
            bombNoLabel.string = bombNo - 1;
            this.removeAllEnemy();
        }
    },
    pauseClick() {
        if (!this.isGameOver) {
            if (this.curState == Gdt.commonInfo.gameState.pause) {
                this.resumeAction();
                this.curState = Gdt.commonInfo.gameState.start;
            } else if (this.curState == Gdt.commonInfo.gameState.start) {
                this.pauseAction();
                this.curState = Gdt.commonInfo.gameState.pause;
            }
        }
    },
    //游戏继续
    resumeAction() {
        this.enemyGroup.resumeAction();
        this.enemyBulletGroup.resumeAction();
        this.bulletGroup.resumeAction();
        this.buffGroup.resumeAction();
        this.hero.onDrag();
        this.pause.getComponent(cc.Sprite).spriteFrame = this.btnSprite[0];
    },
    //游戏暂停
    pauseAction() {
        this.curState = Gdt.commonInfo.gameState.pause;
        this.enemyGroup.pauseAction();
        this.enemyBulletGroup.pauseAction();
        this.bulletGroup.pauseAction();
        this.buffGroup.pauseAction();
        this.hero.offDrag();
        this.pause.getComponent(cc.Sprite).spriteFrame = this.btnSprite[1];
    },
    //增加分数
    gainScore(scoreno) {
        if (this.isGameOver) return;
        this.score += scoreno;
        this.scoreDisplay.string = this.score.toString();
    },
    //get分数
    getScore() {
        return parseInt(this.scoreDisplay.string);
    },
    //炸弹清除敌机
    removeAllEnemy() {
        const children = this.enemyGroup.node.children;
        for (let i = 0; i < children.length; i++) {
            children[i].getComponent('enemy').hP = 0;
            children[i].getComponent('enemy').enemyOver()
        };
        const enemyBulletChildren = this.enemyBulletGroup.node.children;
        for (let i = 0; i < enemyBulletChildren.length; i++) {
            this.enemyBulletGroup.bulletDied(enemyBulletChildren[i])
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
        this.gameOverMaskVis()
    },
    gameOverMaskVis() {
        this.gameOverMask.active = true;
        this.gameOverMask.opacity = 0;
        this.gameOverMask.runAction(
            cc.fadeIn(0.3)
        );
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.requestDbAircraftWarScore()
        };
        this.maskCurrScore.string = 'Current Score: ' + this.score;
        this.maskBestScore.string = 'Best Score: ' + this.bestScore;
    },
    playAgain() {
        cc.director.loadScene('aircraft_war_game')
    },
    backStartScene() {
        cc.director.loadScene('aircraft_war_start')
    },

    //db request
    requestDbAircraftWarScore() {
        const self = this;
        self.db.collection('userGameInfo').where({
            _openid: self.globalUser.openid
        }).get({
            success: res => {
                self.db.collection('userGameInfo').doc(res.data[0]._id).update({
                    data: {
                        aircraftWarBestScore: self.bestScore,
                        updateTime: self.db.serverDate()
                    },
                    success: sc => {
                        self.globalUser.setUserGameInfo('aircraftWarBestScore', self.bestScore);
                        console.log('保存成功')
                    }
                })
            }
        })
    }
})
