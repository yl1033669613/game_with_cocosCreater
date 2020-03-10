const INITOBJPOOLCOUNT = 15;
const COLORLIST = ['255/0/0/255', '255/144/0/255', '255/255/0/255', '0/255/0/255', '0/255/255/255', '0/0/255/255', '114/0/255/255'];
const Utils = require('../utils.js');

cc.Class({
    extends: cc.Component,
    properties: {
        initBorderR: 22,
        initCenterR: 30,
        intervalMul: 0.5,
        tapMax: 3.6,
        gameOverScore: -30,
        compStart: {
            default: null,
            type: require('ftc_start')
        },
        circleItem: {
            default: null,
            type: cc.Prefab
        },
        gameBg: {
            default: null,
            type: cc.Node
        },
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        comboLabel: {
            default: null,
            type: cc.Label
        },
        maskBestScore: {
            default: null,
            type: cc.Label
        },
        maskBestCombo: {
            default: null,
            type: cc.Label
        },
    },
    onLoad() {
        this.circlesCreateState = false;
        this.combo = 0;
        this.score = 0;
        this.bestComboIsUpdate = false;
        this.bestScore = Utils.GD.userGameInfo.ftcBestScore || 0;
        this.bestCombo = Utils.GD.userGameInfo.ftcBestCombo || 0;
        this.maskBestScore.string = 'Best score: ' + this.bestScore;
        this.maskBestCombo.string = 'Best combo: ' + this.bestCombo;
        this.circleGroup = [];
        this.gameOver = false;
        this.initObjPool();
    },
    startCreateCircles() {
        this.unscheduleAllCallbacks();
        this.circlesCreateState = false;
        this.combo = 0;
        this.score = 0;
        this.scoreLabel.string = 'SCORE: ' + this.score;
        this.comboLabel.string = 0;
        this.comboLabel.node.opacity = 0;
        this.gameOver = false;
        this.circleGroup = [];
        this.getRandomCircles();
    },
    initObjPool() {
        this.circleItemObjPool = new cc.NodePool();
        for (let i = 0; i < INITOBJPOOLCOUNT; ++i) {
            let nodeO = cc.instantiate(this.circleItem);
            this.circleItemObjPool.put(nodeO);
        }
    },
    genNewCircle(pool, prefab, nodeParent) {
        let newNode = null;
        if (pool.size() > 0) {
            newNode = pool.get();
        } else {
            newNode = cc.instantiate(prefab);
        };
        nodeParent.addChild(newNode);
        return newNode;
    },
    backObjPool(nodeinfo) {
        this.circleItemObjPool.put(nodeinfo);
    },
    getRandomCircles() { //生成circle时这里不可避免的存在大量计算（判断circle生成时是否重叠），以及计时器（延时从而依次显示）和js动画。
        let self = this;
        let circlesNum = Math.floor(Math.random() * (COLORLIST.length + 0.4 - 3) + 3);
        self.circlesCreateState = true;
        self.loadingBgAni(circlesNum);
        let result = [],
            currArr = COLORLIST.slice(0);
        for (let i = 0; i < circlesNum; i++) {
            let ran = Math.floor(Math.random() * (COLORLIST.length - i));
            result.push(currArr[ran]);
            currArr[ran] = currArr[COLORLIST.length - i - 1];
        };
        let count = 0;
        while (count < circlesNum) {
            let x = (Math.random() * 2 - 1) * (self.node.width / 2 - (self.initCenterR + 2)),
                y = (Math.random() * 2 - 1) * (self.node.height / 2 - (self.initCenterR + 2) - self.initCenterR);
            let isOverlap = false,
                limitDst = Math.sqrt(2 * Math.pow(self.initCenterR * 2, 2));
            for (let i = 0; i < self.circleGroup.length; i++) {
                let currDst = Math.abs(Math.sqrt(Math.pow(x - self.circleGroup[i].x, 2) + Math.pow(y - self.circleGroup[i].y, 2)));
                if (currDst < limitDst) {
                    isOverlap = true;
                    break;
                }
            };
            if (!isOverlap) {
                self.circleGroup.push({
                    color: result[count],
                    x: x,
                    y: y
                });
                count++;
            }
        };
        for (let i = 0; i < self.circleGroup.length; i++) {
            self.scheduleOnce(() => {
                if (self.circlesCreateState) {
                    let item = self.genNewCircle(self.circleItemObjPool, self.circleItem, self.node);
                    let pos = cc.v2(self.circleGroup[i].x, self.circleGroup[i].y);
                    item.setPosition(pos);
                    item.scale = 0;
                    let itemObj = item.getComponent('circle_item'),
                        randomNum = Math.floor(Math.random() * (self.tapMax - 1) + 1);
                    itemObj.itemCircleInit(self.circleGroup[i].color, randomNum, self.initBorderR, self.initCenterR);
                    cc.tween(item).to(1.1, { scale: 1 }, { easing: 'cubicInOut' }).start()
                    if (i == self.circleGroup.length - 1) {
                        self.circlesCreateState = false;
                        let childs = self.node.children;
                        for (let v = 0; v < childs.length; v++) childs[v].getComponent('circle_item').itemCircleInitCount(v);
                    }
                }
            }, (i + 1) * self.intervalMul)
        }
    },
    loadingBgAni(num) {
        let totalTime = (num + 1) * this.intervalMul;
        cc.tween(this.gameBg).to(.3, { color: new cc.Color(90, 146, 185, 255) }).call(() => {
            this.scheduleOnce(() => {
                cc.tween(this.gameBg).to(.3, { color: new cc.Color(255, 255, 255, 255) }).start()
            }, totalTime - 0.1)
        }).start()
    },
    updateComboAndScore(bool, score) {
        if (bool) {
            this.score += score;
            this.combo++;
            if (this.combo > this.bestCombo) {
                this.bestComboIsUpdate = true;
                this.bestCombo = this.combo;
            };
            if (this.combo > 0 && this.combo % 10 == 0) this.score += this.combo / 10;
        } else {
            this.combo = 0;
            this.score -= score;
        };
        this.renderComboAndScoreNum();
        if (this.score <= this.gameOverScore) this.handleGameOver();
    },
    renderComboAndScoreNum() {
        this.scoreLabel.string = 'SCORE: ' + this.score;
        this.comboLabel.string = this.combo;
        if (this.combo) {
            this.comboLabel.node.scale = 1.4;
            this.comboLabel.node.opacity = 1;
            cc.tween(this.comboLabel.node).to(.4, { scale: 1, opacity: 200 }, { easing: 'fade' }).start();
        } else {
            cc.tween(this.comboLabel.node).to(.8, { opacity: 0 }, { easing: 'fade' }).start();
        }
    },
    updateCircleGroup(color, bool) {
        let multArr = [];
        if (this.gameOver) return;
        for (let i = 0; i < this.circleGroup.length; i++) {
            if (this.circleGroup[i].color == color) {
                let currArr;
                currArr = this.circleGroup.splice(0, i + 1);
                multArr = currArr.splice(0, currArr.length - 1);
                if (multArr.length > 0) {
                    const childs = this.node.children;
                    for (let i = 0; i < childs.length; i++) {
                        let childComponent = childs[i].getComponent('circle_item');
                        for (let i = 0; i < multArr.length; i++)
                            if (multArr[i].color == childComponent.color) childComponent.noTouchHideAnimation(true);
                    }
                };
                break;
            }
        };
        this.updateComboAndScore(multArr.length > 0 ? false : bool, multArr.length > 0 ? multArr.length : 1);
        if (this.circleGroup.length == 0 && !this.gameOver) this.getRandomCircles();
    },
    handleGameOver() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.circlesCreateState = false;
        this.updateScore();
        this.updateCombo();
        this.compStart.showGameMask(true);
        const childs = this.node.children;
        for (let i = 0; i < childs.length; i++) {
            let childComponent = childs[i].getComponent('circle_item');
            for (let i = 0; i < this.circleGroup.length; i++)
                if (this.circleGroup[i].color == childComponent.color) childComponent.noTouchHideAnimation(true);
        }
    },
    updateScore() {
        const self = this;
        if (self.score > self.bestScore) {
            self.bestScore = self.score;
            this.maskBestScore.string = 'Best score: ' + this.bestScore;
            Utils.GD.updateGameScore({
                ftcBestScore: self.bestScore
            }, () => {
                Utils.GD.setUserGameInfo('ftcBestScore', self.bestScore);
                console.log('分数保存成功')
            })
        }
    },
    updateCombo() {
        const self = this;
        if (self.bestComboIsUpdate) {
            this.maskBestCombo.string = 'Best combo: ' + this.bestCombo;
            Utils.GD.updateGameScore({
                ftcBestCombo: self.bestCombo
            }, () => {
                Utils.GD.setUserGameInfo('ftcBestCombo', self.bestCombo);
                console.log('连击保存成功')
            })
        }
    }
})