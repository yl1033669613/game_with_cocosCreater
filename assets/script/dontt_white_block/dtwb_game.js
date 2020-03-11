const INITPOOLCOUNT = 10;
const Utils = require('../utils.js');
cc.Class({
    extends: cc.Component,
    properties: {
        scoreLabel: {
            default: null,
            type: cc.Label
        },
        rowPfb: {
            default: null,
            type: cc.Prefab
        },
        gameOverMask: {
            default: null,
            type: cc.Node
        },
        maskCurrScore: {
            default: null,
            type: cc.Label
        },
        bestScore: {
            default: null,
            type: cc.Label
        },
        initSpeed: 7,
        maxSpeed: 13
    },
    onLoad() {
        this.gameState = 0; // 0 未开始 1 开始 2结束 
        this.rowNodeList = [];
        this.speed = 0;
        this.score = 0;
        this.bestSco = Utils.GD.userGameInfo.donttWhiteBlockScore || 0;
        this.rowPool = new cc.NodePool();
        for (let i = 0; i < INITPOOLCOUNT; ++i) {
            let nodeO = cc.instantiate(this.rowPfb);
            this.rowPool.put(nodeO);
        };
    },
    start() {
        this.updateUi();
        for (let i = 0; i < 6; i++) this.createMoveRow(i == 0)
    },
    update(dt) {
        if (this.gameState == 1) {
            this.rowNodeList.forEach((a) => {
                a.y = a.y - this.speed;
            })
        }
    },
    updateScore() {
        this.score++;
        //速度均匀递增 400分打到最大速度， 每10分递增一次
        if (this.score != 0 && !(this.score % 10) && this.speed < this.maxSpeed) this.speed += (this.maxSpeed - this.initSpeed) / 40;
        this.updateUi();
    },
    updateUi() {
        this.scoreLabel.string = this.score;
        this.maskCurrScore.string = 'Current score: ' + this.score;
        this.bestScore.string = 'Best score: ' + this.bestSco;
    },
    createMoveRow(isFirst) {
        let node,
            rowHeight = this.node.height / 4,
            lastNode = this.rowNodeList.length > 0 ? this.rowNodeList[this.rowNodeList.length - 1] : null;
        if (this.rowPool.size() > 0) {
            node = this.rowPool.get();
        } else {
            node = cc.instantiate(this.rowPfb);
        };
        if (lastNode) {
            node.setPosition(0, lastNode.y + rowHeight);
        } else {
            node.setPosition(0, rowHeight);
        };
        this.node.addChild(node);
        let compObj = node.getComponent('block_row');
        compObj.init(isFirst);
        this.rowNodeList.push(node);
    },
    startRowAction() {
        this.speed = this.initSpeed;
    },
    gameOver() {
        this.gameState = 2;
        if (this.score > this.bestSco) {
            this.bestSco = this.score;
            this.updateUi();
            this.upadteBestScore();
        };
        this.showGameOverMask(true);
    },
    showGameOverMask(bool) {
        let action;
        if (bool) {
            this.gameOverMask.active = true;
            this.gameOverMask.opacity = 1;
            action = cc.tween().to(.3, { opacity: 255 });
        } else {
            action = cc.tween().to(.3, { opacity: 0 }).call(() => {
                this.gameOverMask.active = false;
            });
        };
        cc.tween(this.gameOverMask).then(action).start()
    },
    backObjPool(nodeInfo) {
        this.rowPool.put(nodeInfo);
    },
    backStartPage() {
        cc.director.loadScene('dontt_white_block_start');
    },
    restartGame() {
        this.showGameOverMask(false);
        this.rowNodeList.forEach((a) => {
            this.rowPool.put(a);
        });
        this.rowNodeList = [];
        this.gameState = 0;
        this.speed = 0;
        this.score = 0;
        this.updateUi();
        for (let i = 0; i < 6; i++) this.createMoveRow(i == 0);
    },
    upadteBestScore() {
        const self = this;
        Utils.GD.updateGameScore({
            donttWhiteBlockScore: self.bestSco
        }, () => {
            Utils.GD.setUserGameInfo('donttWhiteBlockScore', self.bestSco);
            console.log('保存成功');
        })
    }
})