const Gdt = require('globals');

//敌机组
let enemyG = cc.Class({
    name: 'enemyG',
    properties: {
        name: '',
        freqTime: 0,
        initPoolCount: 0,
        prefab: cc.Prefab
    }
});

cc.Class({
    extends: cc.Component,
    properties: () => ({
        enemyG: {
            default: [],
            type: enemyG
        },
        main: {
            default: null,
            type: require('main'),
        }
    }),
    onLoad() {
        //初始化敌机组
        this.curState = Gdt.commonInfo.gameState.none;
        Gdt.common.batchInitObjPool(this, this.enemyG)
    },
    startAction() {
        this.curState = Gdt.commonInfo.gameState.start;
        //定时生成敌机
        for (let i = 0; i < this.enemyG.length; ++i) {
            let freqTime = this.enemyG[i].freqTime;
            let fName = 'callback_' + i;
            this[fName] = function(e) { this.getNewEnemy(this.enemyG[e]) }.bind(this, i);
            this.schedule(this[fName], freqTime);
        }
    },
    //重新开始
    resumeAction() {
        this.enabled = true;
        this.curState = Gdt.commonInfo.gameState.start;
    },
    //暂停
    pauseAction() {
        this.enabled = false;
        this.curState = Gdt.commonInfo.gameState.pause;
    },
    //生成敌机
    getNewEnemy(enemyInfo) {
        let poolName = enemyInfo.name + 'Pool';
        let newNode = Gdt.common.genNewNode(this[poolName], enemyInfo.prefab, this.node);
        let newV2 = this.getNewEnemyPositon(newNode);
        newNode.setPosition(newV2);
        newNode.getComponent('enemy').poolName = poolName;
        newNode.getComponent('enemy').init();
    },
    //敌机随机生成的位置
    getNewEnemyPositon(newEnemy) {
        //位于上方，先不可见
        let randx = cc.randomMinus1To1() * (this.node.parent.width / 2 - newEnemy.width / 2);
        let randy = this.node.parent.height / 2 + newEnemy.height / 2;
        return cc.v2(randx, randy);
    },
    enemyDied(nodeinfo, score) {
        let poolName = nodeinfo.getComponent('enemy').poolName;
        Gdt.common.backObjPool(this, poolName, nodeinfo);
        //增加分数
        if (parseInt(score) > 0) {
            this.main.gainScore(score);
        }
    },
    getScore() {
        return this.main.getScore();
    }
})
