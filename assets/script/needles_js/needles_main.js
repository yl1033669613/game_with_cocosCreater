const gbData = require('./game_global.js');

cc.Class({
    extends: cc.Component,

    properties: {
        bigCircle: {
            default: null,
            type: cc.Node
        },
        needlePfb: {
            default: null,
            type: cc.Prefab
        },
        moveNeedle: {
            default: null,
            type: cc.Node
        },
        waitContent: {
            default: null,
            type: cc.Node
        },
        modeTypeTxt: {
            default: null,
            type: cc.Node
        },
        levelTxt: {
            default: null,
            type: cc.Node
        },
        gameInfoMask: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.needlesNum = '';
        this.freeModeCurrNeedle = 0;
        this.freeModeCurrScore = 0;
        this.rotateSpeed = 12;
        this.isGameOver = false;

        this.globalUser = cc.director.getScene().getChildByName('gameUser').getComponent('game_user_js');
        this.db = wx.cloud.database();

        if (!this.globalUser.userGameInfo.needleLevelModeLevels || typeof this.globalUser.userGameInfo.needleFreeModeScore != 'number') {
            this.requestDbNeedleFreeModeScore();
            this.requestDbNeedleLevelModeLevels();
        }
    },

    LevelSceneInit() {
        if (gbData.mode === 'level') { //初始化level mode 渲染
            let level = gbData.gameLevel,
                ld = gbData.gameLevelData;
            let isL = ld.filter((a) => {
                return a.level == level
            });
            if (isL.length > 0) {
                let gdn = isL[0].generatedNeedlesAngle;
                for (let i = 0; i < gdn.length; i++) {
                    let needleBody = cc.instantiate(this.needlePfb);
                    needleBody.rotation = gdn[i];
                    needleBody.getComponent('draw_needles').speed = isL[0].speed;
                    this.bigCircle.addChild(needleBody);
                };
                this.circleRotate(isL[0].speed);
                this.needlesNum = isL[0].needlesNum;
                this.rotateSpeed = isL[0].speed;
            }
        } else {
            this.circleRotate(5);
            this.needlesNum = '';
        }
    },

    createNeedles() {
        let needleBody = cc.instantiate(this.needlePfb);
        let rotation = 360 - (this.bigCircle.rotation % 360);
        needleBody.rotation = rotation;
        let num = 0,
            speed = 5;
        if (gbData.mode === 'level') {
            num = this.needlesNum + 1;
            speed = this.rotateSpeed;
        } else {
            num = this.freeModeCurrNeedle;
        }
        needleBody.getChildByName('needleNum').getComponent(cc.Label).string = num;
        needleBody.getComponent('draw_needles').speed = speed;
        this.bigCircle.addChild(needleBody);
    },

    circleRotate(speed) {
        let rotate = cc.repeatForever(cc.sequence(cc.rotateBy(0, 0), cc.rotateBy(speed, 360)));
        this.bigCircle.runAction(rotate);
    },

    userHandle() {
        this.node.on(cc.Node.EventType.TOUCH_START, function(e) {
            if (!this.isGameOver) {
                this.needleMove();
            }
        }, this)
    },

    needleMove() {
        this.moveNeedle.active = true;
        if (gbData.mode === 'level') {
            this.needlesNum--;
        } else {
            this.freeModeCurrNeedle++;
        };

        this.waitNeedlesNumUpdate(); //更新等待视图

        let moveAction = cc.sequence(
            cc.moveBy(.06, 0, 41),
            cc.moveTo(0, 0, 39),
            cc.callFunc(() => {
                this.moveNeedle.active = false;
                this.createNeedles();
                if (this.isGameOver) {
                    this.gameOverShowInfoMask();
                };
                if (!this.isGameOver && gbData.mode === 'level' && this.needlesNum == 0) {
                    this.isGameOver = true;
                    this.gameLevelModeThislevelWin()
                };
                if (!this.isGameOver && gbData.mode === 'free') {
                    this.freeModeCurrScore++
                }
            }, this));
        this.moveNeedle.runAction(moveAction);
    },

    waitNeedlesNumUpdate() {
        let child = this.waitContent.children;
        if (gbData.mode === 'level') {
            if (this.needlesNum >= 6) {
                for (let i = 6; i > 0; i--) {
                    child[6 - i].getChildByName('wcTxt').getComponent(cc.Label).string = this.needlesNum - 6 + i;
                }
            } else {
                for (let i = this.needlesNum; i > 0; i--) {
                    child[this.needlesNum - i].getChildByName('wcTxt').getComponent(cc.Label).string = i;
                };
                for (let i = this.needlesNum; i < 6; i++) {
                    child[i].active = false;
                }
            }
        } else {
            for (let i = 0; i < 6; i++) {
                child[i].getChildByName('wcTxt').getComponent(cc.Label).string = this.freeModeCurrNeedle + i + 1;
            }
        }
    },

    backStart() {
        cc.director.loadScene('game_needles_start');
    },

    gameOver() {
        this.isGameOver = true;
    },

    gameOverShowInfoMask() {
        let gameMode = this.gameInfoMask.getChildByName('gameMaskModeType'),
            freeModeBestScore = this.gameInfoMask.getChildByName('freeModeBestScore'),
            levelModeTxt = this.gameInfoMask.getChildByName('levelModeTxt'),
            btnRestart = this.gameInfoMask.getChildByName('restart');
        gameMode.getComponent(cc.Label).string = gbData.mode + ' mode';
        if (gbData.mode === 'level') {
            freeModeBestScore.active = false;
            levelModeTxt.active = true;
            levelModeTxt.getComponent(cc.Label).string = 'level: ' + gbData.gameLevel;
        } else {
            freeModeBestScore.active = true;
            levelModeTxt.active = false;
            btnRestart.active = true;
            if (this.freeModeCurrScore > gbData.freeBestScore) {
                gbData.freeBestScore = this.freeModeCurrScore;
                this.requestDbNeedleFreeModeScore();
            };
            freeModeBestScore.getComponent(cc.Label).string = 'best score: ' + gbData.freeBestScore;
        };
        this.gameOverMaskVis();
    },

    gameLevelModeThislevelWin() {
        let gameMode = this.gameInfoMask.getChildByName('gameMaskModeType'),
            freeModeBestScore = this.gameInfoMask.getChildByName('freeModeBestScore'),
            levelModeTxt = this.gameInfoMask.getChildByName('levelModeTxt'),
            btnRestart = this.gameInfoMask.getChildByName('restart'),
            btnNext = this.gameInfoMask.getChildByName('next');
        gameMode.getComponent(cc.Label).string = gbData.mode + ' mode';
        freeModeBestScore.active = false;
        levelModeTxt.active = true;
        btnRestart.active = false;
        btnNext.active = true;
        gbData.gameLevel++;
        if (gbData.gameLevel > gbData.gameLevelData.length) {
            gbData.gameLevel = 1;
            btnNext.active = false;
            levelModeTxt.getComponent(cc.Label).string = 'You have reached the last pass.';
        } else {
            levelModeTxt.getComponent(cc.Label).string = 'level: ' + gbData.gameLevel;
        };
        this.requestDbNeedleLevelModeLevels();
        this.gameOverMaskVis();
    },

    requestDbNeedleFreeModeScore() {
        let self = this;
        self.db.collection('userGameInfo').where({
            _openid: self.globalUser.openid
        }).get({
            success: function(res) {
                self.db.collection('userGameInfo').doc(res.data[0]._id).update({
                    data: {
                        'needleFreeModeScore': gbData.freeBestScore,
                        'updateTime': self.db.serverDate()
                    },
                    success: function(sc) {
                        self.globalUser.setUserGameInfo('needleFreeModeScore', gbData.freeBestScore);
                        console.log('保存成功')
                    }
                })
            }
        })
    },

    requestDbNeedleLevelModeLevels() {
        let self = this;
        self.db.collection('userGameInfo').where({
            _openid: self.globalUser.openid
        }).get({
            success: function(res) {
                self.db.collection('userGameInfo').doc(res.data[0]._id).update({
                    data: {
                        'needleLevelModeLevels': gbData.gameLevel,
                        'updateTime': self.db.serverDate()
                    },
                    success: function(sc) {
                        self.globalUser.setUserGameInfo('needleLevelModeLevels', gbData.gameLevel);
                        console.log('保存成功')
                    }
                })
            }
        })
    },

    gameOverMaskVis() {
        this.gameInfoMask.active = true;
        this.gameInfoMask.opacity = 0;
        this.gameInfoMask.runAction(cc.sequence(
            cc.scaleTo(0, 0.9, 0.9),
            cc.spawn(cc.scaleTo(0.2, 1, 1), cc.fadeIn(0.3))
        ));
    },

    reLoadThisScene (){
        cc.director.loadScene('game_needles');
    },

    start() {
        this.modeTypeTxt.getComponent(cc.Label).string = gbData.mode + ' mode';
        if (gbData.mode === 'level') {
            this.levelTxt.active = true;
            this.levelTxt.getComponent(cc.Label).string = 'level: ' + gbData.gameLevel;
        };
        this.LevelSceneInit();
        this.waitNeedlesNumUpdate();
        this.userHandle();
    }
});
