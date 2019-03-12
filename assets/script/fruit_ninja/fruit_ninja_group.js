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
        fruitG: {
            default: [],
            type: fruitG
        }
    },
    onLoad() {
        this.fruitList = [];
        utils.batchInitObjPool(this, this.fruitG);
    },
    start() {
        this.createFruitList()
    },
    createFruitList() {
        let fruit = this.fruitG[0];
        let fruitNode = utils.genNewNode(this[fruit.name + 'Pool'], fruit.prefab, this.node);
        fruitNode.setPosition(cc.p(0 ,0));
        fruitNode.getComponent('fruit_ninja_fruit').init();
    },  
    checkRemain() {

    },
});
