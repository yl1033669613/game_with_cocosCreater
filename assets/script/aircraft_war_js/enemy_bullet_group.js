const Gdt = require('globals');
let enemyBPosition = cc.Class({
    name: 'enemyBPosition',
    properties: {
        xAxis: {
            default: ''
        },
        yAxis: {
            default: ''
        }
    }
});
let enemybulletIfe = cc.Class({
    name: 'enemybulletIfe',
    properties: {
        name: '',
        freqTime: 0,
        initPoolCount: 0,
        prefab: cc.Prefab,
        position: {
            default: [],
            type: enemyBPosition
        }
    }
});
cc.Class({
    extends: cc.Component,
    properties: {
        enemybulletIfe: {
            default: null,
            type: enemybulletIfe
        }
    },
    onLoad() {
        this.curState = Gdt.commonInfo.gameState.start;
        //初始enemy bullet
        Gdt.common.initObjPool(this, this.enemybulletIfe);
    },
    enemyOpenFire(gteBEnemyInfo) {
        this.getNewbullet(this.enemybulletIfe, gteBEnemyInfo);
    },
    pauseAction() {
        this.enabled = false;
        this.curState = Gdt.commonInfo.gameState.pause;
    },
    resumeAction() {
        this.enabled = true;
        this.curState = Gdt.commonInfo.gameState.start;
    },
    //生成敌机子弹
    getNewbullet(bulletInfo, gteInfo) {
        const poolName = bulletInfo.name + 'Pool';
        for (let bc = 0; bc < bulletInfo.position.length; bc++) {
            let newNode = Gdt.common.genNewNode(this[poolName], bulletInfo.prefab, this.node);
            let newV2 = this.getBulletPostion(bulletInfo.position[bc], gteInfo);
            newNode.setPosition(newV2);
            let newNodeComp = newNode.getComponent('enemy_bullet');
            newNodeComp.poolName = poolName;
            newNodeComp.ySpeed = gteInfo.getComponent('enemy').ySpeed - 50;
        }
    },
    getBulletPostion(posInfo, gteInfo) {
        const hPos = gteInfo.getPosition(),
            newV2_x = hPos.x + parseFloat(posInfo.xAxis),
            newV2_y = hPos.y + parseFloat(posInfo.yAxis);
        return cc.p(newV2_x, newV2_y);
    },
    //回收节点
    bulletDied(nodeinfo) {
        const poolName = nodeinfo.getComponent('enemy_bullet').poolName;
        Gdt.common.backObjPool(this, poolName, nodeinfo);
    }
})
