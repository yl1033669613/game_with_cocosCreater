const utils = require('../utils');
const INITPOOLCOUNT = 20;

let juiceColor = cc.Class({
    name: 'juiceColor',
    properties: {
        code: 0,
        color: cc.Color,
        opacity: 255
    }
});

cc.Class({
    extends: cc.Component,
    properties: {
        juiceColor: {
            default: [],
            type: juiceColor
        },
        juicePfb: {
            default: null,
            type: cc.Prefab
        }
    },
    onLoad () {
        let createPoolObj = {
            name: 'fruitJuice',
            prefab: this.juicePfb,
            initPoolCount: INITPOOLCOUNT
        };
        this.poolName = 'fruitJuicePool';
        utils.initObjPool(this, createPoolObj);
    },
    createjuiceBg(pos, colorType) {
        let currjuiceColor = this.juiceColor.filter((a) => {
            return a.code == colorType
        })[0];
        let color = currjuiceColor.color;
        let rotation = utils.random(0, 359);
        let opacity = currjuiceColor.opacity;
        let juiceNode = utils.genNewNode(this[this.poolName], this.juicePfb, this.node);
        juiceNode.setPosition(pos);
        juiceNode.getComponent('fruit_juice').init(rotation, color, opacity);
    },
    backNode(nodeInfo) {
        utils.backObjPool(this, this.poolName, nodeInfo)
    }
});
