const Gdt = require('globals');
const utils = require('../utils');

let gameState = cc.Enum({
    none: 0,
    start: 1,
    stop: 2,
    pause: 3
});
let common = cc.Class({
    extends: cc.Component,
    properties: {},
    statics: {
        gameState
    },
    onLoad() {
        Gdt.commonInfo = common;
        Gdt.common = this;
        this.batchInitObjPool = utils.batchInitObjPool;
        this.initObjPool = utils.initObjPool;
        this.genNewNode = utils.genNewNode;
        this.backObjPool = utils.backObjPool;
    }
});
