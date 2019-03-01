const Gdt = require('globals');
let buffG = cc.Class({
    name: 'buffG',
    properties: {
        name: '',
        initPoolCount: 0,
        probability: 0.5,
        prefab: {
            default: null,
            type: cc.Prefab
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
        this.curState = Gdt.commonInfo.gameState.start;
        Gdt.common.batchInitObjPool(this, this.buffG);
    },
    createHeroBuff(emInfo) {
        const theEnemy = emInfo.getComponent('enemy');
        for (let i = 0; i < this.buffG.length; i++) {
            if (theEnemy.buffType == this.buffG[i].name)
                if (Math.random() <= this.buffG[i].probability) this.getNewBuff(this.buffG[i], emInfo) //概率生成buff
        }
    },
    getNewBuff(BuffInfo, emInfo) {
        const poolName = BuffInfo.name + 'Pool',
            newNode = Gdt.common.genNewNode(this[poolName], BuffInfo.prefab, this.node),
            emPos = emInfo.getPosition(),
            newPos = cc.p(emPos.x, emPos.y);
        newNode.setPosition(newPos);
        newNode.getComponent('buff').poolName = poolName
    },
    //重新开始
    resumeAction() {
        this.enabled = true;
        this.curState = Gdt.commonInfo.gameState.start
    },
    //暂停
    pauseAction() {
        this.enabled = false;
        this.curState = Gdt.commonInfo.gameState.pause
    },
    buffDied(nodeinfo) {
        //回收节点
        const poolName = nodeinfo.getComponent('buff').poolName;
        Gdt.common.backObjPool(this, poolName, nodeinfo)
    }
})
