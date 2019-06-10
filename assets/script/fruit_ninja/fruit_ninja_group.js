const utils = require('../utils')

let fruitG = cc.Class({
    name: 'fruitG',
    properties: {
        name: '',
        initPoolCount: 10,
        score: 0,
        type: 'fruit',
        prefab: {
            default: null,
            type: cc.Prefab
        }
    }
});
cc.Class({
    extends: cc.Component,
    properties: {
        maxLength: 5,
        flashNode: {
            default: null,
            type: cc.Node
        },
        fruitG: {
            default: [],
            type: fruitG
        }
    },
    onLoad() {
        this.gameObj = this.node.parent.getComponent('fruit_ninja_game');
        this.noBombArr = this.fruitG.filter(a => a.type == 'fruit');
        utils.batchInitObjPool(this, this.fruitG);
    },
    createFruitList() {
        let totalFr = this.fruitG;
        let randomLength = Math.floor(utils.random(1, this.maxLength + 0.4));
        for (let i = 0; i < randomLength; i++) {
            let ran = 0,
                fruit, poolName;
            ran = Math.floor(Math.floor(utils.random(0, totalFr.length - 0.1)));
            fruit = totalFr[ran];
            poolName = fruit.name + 'Pool';
            let fruitNode = utils.genNewNode(this[poolName], fruit.prefab, this.node);
            fruitNode.setPosition(cc.v2(utils.random(-this.node.width / 2 + fruitNode.width / 2, this.node.width / 2 - fruitNode.width / 2), -(this.node.height / 2 - fruitNode.height / 2)));
            fruitNode.getComponent('fruit_ninja_fruit').init(poolName, fruit.score);
            if (fruit.type == 'bomb') {
                totalFr = this.noBombArr;
            };
        };
    },
    checkRemain() {
        if (this.gameObj.gameOver) return;
        let childrenLength = this.node.children.length;
        if (childrenLength == 0) {
            this.scheduleOnce(() => {
                this.createFruitList()
            }, .5, this)
        }
    },
    // 切到炸弹 
    cutBombRemoveAllChildren() {
        this.flashScreen();
        let childObjArr = this.node.children.map((a) => {
            return a.getComponent('fruit_ninja_fruit')
        });
        for (let i = 0; i < childObjArr.length; i++) {
            childObjArr[i].backThisNode(true);
        };
        this.gameObj.lifeConsume();
        this.gameObj.upDateUi();
        if (!this.gameObj.gameOver) {
            this.scheduleOnce(() => {
                this.createFruitList()
            }, 0.5, this)
        }
    },
    //flash when cut the bomb
    flashScreen() {
        this.flashNode.active = true;
        this.flashNode.opacity = 230;
        let action = cc.sequence(cc.fadeOut(0.8), cc.callFunc(() => {
            this.flashNode.active = false;
        }, this));
        this.flashNode.runAction(action);
    }
});