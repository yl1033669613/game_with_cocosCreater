const D = require('globals');
//ufo组
let ufoG = cc.Class({
    name: 'ufoG',
    properties: {
        name: '',
        freqTime: 0,
        prefab: cc.Prefab,
        initPoolCount: 0,
        minDelay: {
            default: 0,
            tooltip: '最小延迟',
        },
        maxDelay: {
            default: 0,
            tooltip: '最大延迟',
        },
    }
});

cc.Class({
    extends: cc.Component,
    properties: {
        ufoG: {
            default: [],
            type: ufoG
        }
    },
    onLoad() {
        this.eState = D.commonInfo.gameState.none;
        D.common.batchInitObjPool(this, this.ufoG);
    },
    startAction() {
        this.eState = D.commonInfo.gameState.start;
        for (let ui = 0; ui < this.ufoG.length; ++ui) {
            let freqTime = this.ufoG[ui].freqTime;
            let fName = 'callback_' + ui;
            this[fName] = function(e) { this.randNewUfo(this.ufoG[e]); }.bind(this, ui);
            this.schedule(this[fName], freqTime);
        }
    },
    randNewUfo(ufoInfo) {
        let delay = Math.random() * (ufoInfo.maxDelay - ufoInfo.minDelay) + ufoInfo.minDelay;
        this.scheduleOnce(function(e) { this.getNewUfo(e); }.bind(this, ufoInfo), delay);
    },
    getNewUfo(ufoInfo) {
        let poolName = ufoInfo.name + 'Pool';
        let newNode = D.common.genNewNode(this[poolName], ufoInfo.prefab, this.node);
        let newV2 = this.getNewUfoPositon(newNode);
        newNode.setPosition(newV2);
        newNode.getComponent('ufo').poolName = poolName;
    },
    getNewUfoPositon(newUfo) {
        let randx = cc.randomMinus1To1() * (this.node.parent.width / 2 - newUfo.width / 2);
        let randy = this.node.parent.height / 2 + newUfo.height / 2;
        return cc.v2(randx, randy);
    },
    //重新开始
    resumeAction() {
        this.enabled = true;
        this.eState = D.commonInfo.gameState.start;
    },
    //暂停
    pauseAction() {
        this.enabled = false;
        this.eState = D.commonInfo.gameState.pause;
    },
    ufoDied(nodeinfo) {
        //回收节点
        let poolName = nodeinfo.getComponent('ufo').poolName;
        D.common.backObjPool(this, poolName, nodeinfo);
    }
})
