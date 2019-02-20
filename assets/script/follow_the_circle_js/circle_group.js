const INITOBJPOOLCOUNT = 15;
const COLORLIST = ['255/0/0/255', '255/144/0/255', '255/255/0/255', '0/255/0/255', '0/255/255/255', '0/0/255/255', '114/0/255/255'];
const CIRCLER = 25;

cc.Class({
    extends: cc.Component,
    properties: {
        initBorderR: 17,
        initCenterR: 25,
        intervalMul: 0.5,
        tapMax: 5,
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
        }
    },
    onLoad() {
        this.circlesCreateState = false;
        this.combo = 0;
        this.score = 0;
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
            this.circleItemObjPool.put(nodeO)
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
        return newNode
    },
    backObjPool(nodeinfo) {
        this.circleItemObjPool.put(nodeinfo);
    },
    getRandomCircles() {
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
            let x = cc.randomMinus1To1() * (self.node.width / 2 - (CIRCLER + 2)),
                y = cc.randomMinus1To1() * (self.node.height / 2 - (CIRCLER + 2) - CIRCLER);
            let isOverlap = false,
                limitDst = Math.sqrt(2 * Math.pow(CIRCLER * 2, 2));
            for (let i = 0; i < self.circleGroup.length; i++) {
                let currDst = Math.abs(Math.sqrt(Math.pow(x - self.circleGroup[i].x, 2) + Math.pow(y - self.circleGroup[i].y, 2)));
                if (currDst < limitDst) {
                    isOverlap = true;
                    break;
                }
            };
            if (!isOverlap) {
                self.circleGroup.push({ color: result[count], x: x, y: y })
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
                    let action = cc.scaleTo(1.1, 1, 1).easing(cc.easeExponentialOut(1.1));
                    item.runAction(action);
                    if (i == self.circleGroup.length - 1) {
                        self.circlesCreateState = false;
                        let childs = self.node.children;
                        for (let v = 0; v < childs.length; v++) {
                            childs[v].getComponent('circle_item').itemCircleInitCount(v);
                        }
                    }
                }
            }, (i + 1) * self.intervalMul)
        }
    },
    loadingBgAni(num) {
        let totalTime = (num + 1) * this.intervalMul,
            action;
        action = cc.sequence(cc.tintTo(.3, 90, 146, 185), cc.tintTo(totalTime - .3, 255, 255, 255));
        this.gameBg.runAction(action)
    },
    updateComboAndScore(bool, score) {
        if (bool) {
            this.score += score;
            this.combo++;
            if (this.combo > 0 && this.combo % 10 == 0) {
                this.score += this.combo / 10
            }
        } else {
            this.combo = 0;
            this.score -= score;
        };
        this.renderComboAndScoreNum();
        if (this.score <= this.gameOverScore) {
            this.handleGameOver()
        }
    },
    renderComboAndScoreNum() {
        this.scoreLabel.string = 'SCORE: ' + this.score;
        this.comboLabel.string = this.combo;
        if (this.combo) {
            this.comboLabel.node.scale = 1.4;
            this.comboLabel.node.opacity = 0;
            this.comboLabel.node.runAction(cc.spawn(cc.scaleTo(0.6, 1, 1).easing(cc.easeExponentialOut(0.6)), cc.fadeTo(0.6, 200)));
        } else {
            this.comboLabel.node.runAction(cc.fadeOut(.8));
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
                        for (let i = 0; i < multArr.length; i++) {
                            if (multArr[i].color == childComponent.color) {
                                childComponent.noTouchHideAnimation(true)
                            }
                        }
                    }
                }
                break
            }
        };
        this.updateComboAndScore(multArr.length > 0 ? false : bool, multArr.length > 0 ? multArr.length : 1);
        if (this.circleGroup.length == 0 && !this.gameOver) {
            this.getRandomCircles()
        }
    },
    handleGameOver() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.circlesCreateState = false;
        this.compStart.showGameMask(true);
        const childs = this.node.children;
        for (let i = 0; i < childs.length; i++) {
            let childComponent = childs[i].getComponent('circle_item');
            for (let i = 0; i < this.circleGroup.length; i++) {
                if (this.circleGroup[i].color == childComponent.color) {
                    childComponent.noTouchHideAnimation(true)
                }
            }
        }
    }
})
