const Gdt = require('globals');

//子弹生成位置
let bPosition = cc.Class({
    name: 'bPosition',
    properties: {
        xAxis: {
            default: ''
        },
        yAxis: {
            default: ''
        },
    },
});

//不限时长子弹
let bulletInfinite = cc.Class({
    name: 'bulletInfinite',
    properties: {
        name: '',
        freqTime: 0,
        initPoolCount: 0,
        prefab: cc.Prefab,
        position: {
            default: [],
            type: bPosition
        }
    }
});

//有限时长子弹组
let bulletFiniteG = cc.Class({
    name: 'bulletFiniteG',
    extends: bulletInfinite,
    properties: {
        finiteTime: 0,
        orginName: '',
    }
});

cc.Class({
    extends: cc.Component,
    properties: () => ({
        bulletInfinite: {
            default: null,
            type: bulletInfinite
        },
        bulletFiniteG: {
            default: [],
            type: bulletFiniteG
        },
        hero: {
            default: null,
            type: cc.Node
        }
    }),
    onLoad() {
        this.curState = Gdt.commonInfo.gameState.none;
        this.isDeadBullet = false;
        //初始化无限子弹组
        Gdt.common.initObjPool(this, this.bulletInfinite);
        //初始化有限子弹组
        Gdt.common.batchInitObjPool(this, this.bulletFiniteG);
    },

    startAction() {
        this.curState = Gdt.commonInfo.gameState.start;
        //生成子弹
        this.getNewbullet(this.bulletInfinite);
        this.bICallback = function() { this.getNewbullet(this.bulletInfinite); this.isDeadBullet = false }.bind(this);
        this.schedule(this.bICallback, this.bulletInfinite.freqTime);
    },
    pauseAction() {
        this.enabled = false;
        this.curState = Gdt.commonInfo.gameState.pause;
    },
    resumeAction() {
        this.enabled = true;
        this.curState = Gdt.commonInfo.gameState.start;
    },
    //换子弹
    changeBullet(BuffBullet) {
        if (this.isDeadBullet) return;
        this.unschedule(this.bICallback);
        this.unschedule(this.bFCallback);
        for (let bi = 0; bi < this.bulletFiniteG.length; bi++) {
            if (this.bulletFiniteG[bi].orginName == BuffBullet) {
                this.bFCallback = function(e) { this.getNewbullet(this.bulletFiniteG[e]); this.isDeadBullet = true }.bind(this, bi);
                this.schedule(this.bFCallback, this.bulletFiniteG[bi].freqTime, this.bulletFiniteG[bi].finiteTime);
                let delay = this.bulletFiniteG[bi].freqTime * this.bulletFiniteG[bi].finiteTime;
                this.schedule(this.bICallback, this.bulletInfinite.freqTime, cc.macro.REPEAT_FOREVER, delay);
            }
        }
    },
    //生成子弹
    getNewbullet(bulletInfo) {
        let poolName = bulletInfo.name + 'Pool';
        for (let bc = 0; bc < bulletInfo.position.length; bc++) {
            let newNode = Gdt.common.genNewNode(this[poolName], bulletInfo.prefab, this.node);
            let newV2 = this.getBulletPostion(bulletInfo.position[bc]);
            newNode.setPosition(newV2);
            newNode.getComponent('bullet').poolName = poolName;
        }
    },
    //获取子弹位置
    getBulletPostion(posInfo) {
        let hPos = this.hero.getPosition();
        let newV2_x = hPos.x + parseFloat(posInfo.xAxis);
        let newV2_y = hPos.y + parseFloat(posInfo.yAxis);
        return cc.p(newV2_x, newV2_y);
    },
    //回收节点
    bulletDied(nodeinfo) {
        let poolName = nodeinfo.getComponent('bullet').poolName;
        Gdt.common.backObjPool(this, poolName, nodeinfo);
    }
})
