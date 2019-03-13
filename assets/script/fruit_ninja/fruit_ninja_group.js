const utils = require('../utils')

let fruitG = cc.Class({
    name: 'fruitG',
    properties: {
        name: '',
        initPoolCount: 10,
        juiceColor: 1,
        score: 0,
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
        fruitG: {
            default: [],
            type: fruitG
        }
    },
    onLoad() {
        utils.batchInitObjPool(this, this.fruitG);
    },
    start() {
        this.createFruitList()
    },
    createFruitList() {
        let randomLength = Math.floor(utils.random(1, this.maxLength + 0.4));
        for (let i = 0; i < randomLength; i++) {
            let ran = Math.floor(Math.floor(utils.random(0, this.fruitG.length - 0.1))),
                fruit = this.fruitG[ran],
                poolName = fruit.name + 'Pool';
            let fruitNode = utils.genNewNode(this[poolName], fruit.prefab, this.node);
            fruitNode.setPosition(cc.p(utils.random(-this.node.width / 2 + fruitNode.width / 2, this.node.width / 2 - fruitNode.width / 2), -(this.node.height / 2 - fruitNode.height / 2)));
            fruitNode.getComponent('fruit_ninja_fruit').init(poolName);
        };
    },
    checkRemain() {
        let childrenLength = this.node.children.length;
        if (childrenLength == 0) {
            this.scheduleOnce(() => {
                this.createFruitList()
            }, .5, this)
        }
    },
});
