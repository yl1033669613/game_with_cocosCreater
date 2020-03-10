const gbData = require('./game_global.js');
const Utils = require('../utils.js');
const DEFAULTSPEED = 4;
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
    onLoad() {
        this.needlesNum = '';
        this.freeModeCurrNeedle = 0;
        this.freeModeCurrScore = 0;
        this.rotateSpeed = 12;
        this.isGameOver = false;
        this.actionInts = null;
        //create obj pool
        this.needlesPool = new cc.NodePool();
        const initCount = 40;
        for (let i = 0; i < initCount; ++i) {
            let needles = cc.instantiate(this.needlePfb); // 创建节点
            this.needlesPool.put(needles); // 通过 putInPool 接口放入对象池
        };
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
                    let needleBody;
                    if (this.needlesPool.size() > 0) {
                        needleBody = this.needlesPool.get();
                    } else {
                        needleBody = cc.instantiate(this.needlePfb);
                    };
                    needleBody.angle = gdn[i];
                    needleBody.getComponent('draw_needles').speed = isL[0].speed;
                    this.bigCircle.addChild(needleBody);
                };
                this.actionInts = this.circleRotate(isL[0].speed);
                this.needlesNum = isL[0].needlesNum;
                this.rotateSpeed = isL[0].speed;
            }
        } else {
            this.actionInts = this.circleRotate(DEFAULTSPEED);
            this.needlesNum = '';
        }
    },
    createNeedles(cb) {
        let needleBody;
        if (this.needlesPool.size() > 0) {
            needleBody = this.needlesPool.get();
        } else {
            needleBody = cc.instantiate(this.needlePfb);
        };
        let rotation = 360 - (this.bigCircle.angle % 360);
        needleBody.angle = rotation;
        let num = 0,
            speed = DEFAULTSPEED;
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
        let rotate = cc.tween(this.bigCircle).by(speed, { angle: 360 }).repeatForever().start();
        return rotate;
    },
    userHandle() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
            if (!this.isGameOver) this.needleMove()
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
        cc.tween(this.moveNeedle).by(.06, { position: cc.v2(0, 41) }).to(0, { position: cc.v2(0, 39) }).call(() => {
            this.moveNeedle.active = false;
            this.createNeedles();
            if (!this.isGameOver && gbData.mode === 'level' && this.needlesNum == 0) {
                this.isGameOver = true;
                this.gameLevelModeThislevelWin()
            };
            if (!this.isGameOver && gbData.mode === 'free') this.freeModeCurrScore++;
            if (this.isGameOver) {
                let arr = this.bigCircle.children.filter((a) => {
                    return a.name == 'needle';
                });
                arr.forEach((a) => {
                    a.getComponent('draw_needles').stopNeedleAction();
                });
            }
        }).start()
    },
    waitNeedlesNumUpdate() {
        let child = this.waitContent.children;
        if (gbData.mode === 'level') {
            if (this.needlesNum >= 6) {
                for (let i = 6; i > 0; i--) child[6 - i].getChildByName('wcTxt').getComponent(cc.Label).string = this.needlesNum - 6 + i
            } else {
                for (let i = this.needlesNum; i > 0; i--) child[this.needlesNum - i].getChildByName('wcTxt').getComponent(cc.Label).string = i;
                for (let i = this.needlesNum; i < 6; i++) child[i].active = false;
            }
        } else {
            for (let i = 0; i < 6; i++) child[i].getChildByName('wcTxt').getComponent(cc.Label).string = this.freeModeCurrNeedle + i + 1;
        }
    },
    backStart() {
        cc.director.loadScene('game_needles_start');
    },
    gameOver() {
        if (!this.isGameOver) {
            this.isGameOver = true;
            this.actionInts.stop();
            this.gameOverShowInfoMask();
            if (gbData.mode === 'free' && this.freeModeCurrScore === this.freeModeCurrNeedle) this.freeModeCurrScore--;
        }
    },
    gameOverShowInfoMask() {
        const gameMode = this.gameInfoMask.getChildByName('gameMaskModeType'),
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
        const gameMode = this.gameInfoMask.getChildByName('gameMaskModeType'),
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
    //保存free mode 分数
    requestDbNeedleFreeModeScore() {
        Utils.GD.updateGameScore({ needleFreeModeScore: gbData.freeBestScore }, () => {
            Utils.GD.setUserGameInfo('needleFreeModeScore', gbData.freeBestScore);
            console.log('保存成功');
        })
    },
    //保存level mode levels
    requestDbNeedleLevelModeLevels() {
        Utils.GD.updateGameScore({ needleLevelModeLevels: gbData.gameLevel }, () => {
            Utils.GD.setUserGameInfo('needleLevelModeLevels', gbData.gameLevel);
            console.log('保存成功');
        })
    },
    gameOverMaskVis() {
        this.gameInfoMask.active = true;
        this.gameInfoMask.opacity = 1;
        cc.tween(this.gameInfoMask).to(0, { scale: .95, opacity: 1 }).to(.3, { scale: 1, opacity: 255 }).start()
    },
    reLoadThisScene() {
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
})
