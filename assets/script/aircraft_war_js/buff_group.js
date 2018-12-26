const D = require('globals');
//ufo组
let buffG = cc.Class({
    name: 'buffG',
    properties: {
        name: '',
        freqTime: 0,
        prefab: cc.Prefab,
        initPoolCount: 0,
        minDelay: {
            default: 0
        },
        maxDelay: {
            default: 0
        }
    }
});

cc.Class({
    extends: cc.Component,
    properties: {
        buffG: {
            default: [],
            type: buffG
        }
    },
    onLoad() {
        this.eState = D.commonInfo.gameState.none;
        D.common.batchInitObjPool(this, this.buffG);
    },
    startAction() {
        this.eState = D.commonInfo.gameState.start;
        for (let i = 0; i < this.buffG.length; ++i) {
            let freqTime = this.buffG[i].freqTime;
            let bufName = 'callback_' + i;
            this[bufName] = function(e) { this.randNewBuff(this.buffG[e]) }.bind(this, i);
            this.schedule(this[bufName], freqTime);
        }
    },
    randNewBuff(BuffInfo) {
        let delay = Math.random() * (BuffInfo.maxDelay - BuffInfo.minDelay) + BuffInfo.minDelay;
        this.scheduleOnce(function(e) { this.getNewBuff(e); }.bind(this, BuffInfo), delay);
    },
    getNewBuff(BuffInfo) {
        let poolName = BuffInfo.name + 'Pool';
        let newNode = D.common.genNewNode(this[poolName], BuffInfo.prefab, this.node);
        let newV2 = this.getNewBuffPositon(newNode);
        newNode.setPosition(newV2);
        newNode.getComponent('buff').poolName = poolName;
    },
    getNewBuffPositon(newBuff) {
        let randx = cc.randomMinus1To1() * (this.node.parent.width / 2 - newBuff.width / 2);
        let randy = this.node.parent.height / 2 + newBuff.height / 2;
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
    buffDied(nodeinfo) {
        //回收节点
        let poolName = nodeinfo.getComponent('buff').poolName;
        D.common.backObjPool(this, poolName, nodeinfo);
    }
})
