const D = require('globals');

//子弹生成位置
let bPosition = cc.Class({
    name: 'bPosition',
    properties: {
        xAxis: {
            default: '',
            tooltip: '初始x轴，相对hero',
        },
        yAxis: {
            default: '',
            tooltip: '初始y轴，相对hero'
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
            type: bPosition,
            tooltip: '每次多少排子弹',
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
            type: bulletInfinite,
            tooltip: '无限时长子弹组'
        },
        bulletFiniteG: {
            default: [],
            type: bulletFiniteG,
            tooltip: '有限时长子弹组'
        },
        hero: {
            default: null,
            type: cc.Node
        }
    }),
    onLoad() {
        this.eState = D.commonInfo.gameState.none;
        //初始化无限子弹组
        D.common.initObjPool(this, this.bulletInfinite);
        //初始化有限子弹组
        D.common.batchInitObjPool(this, this.bulletFiniteG);
    },

    startAction() {
        this.eState = D.commonInfo.gameState.start;
        //生成子弹
        this.getNewbullet(this.bulletInfinite);
        this.bICallback = function() { this.getNewbullet(this.bulletInfinite) }.bind(this);
        this.schedule(this.bICallback, this.bulletInfinite.freqTime);
    },
    pauseAction() {
        this.enabled = false;
        this.eState = D.commonInfo.gameState.pause;
    },
    resumeAction() {
        this.enabled = true;
        this.eState = D.commonInfo.gameState.start;
    },
    //换子弹
    changeBullet(ufoBulletName) {
        this.unschedule(this.bICallback);
        this.unschedule(this.bFCallback);
        for (let bi = 0; bi < this.bulletFiniteG.length; bi++) {
            if (this.bulletFiniteG[bi].orginName == ufoBulletName) {
                this.bFCallback = function(e) { this.getNewbullet(this.bulletFiniteG[e]); }.bind(this, bi);
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
            let newNode = D.common.genNewNode(this[poolName], bulletInfo.prefab, this.node);
            let newV2 = this.getBulletPostion(bulletInfo.position[bc]);
            newNode.setPosition(newV2);
            newNode.getComponent('bullet').poolName = poolName;
        }
    },
    //获取子弹位置
    getBulletPostion(posInfo) {
        let hPos = this.hero.getPosition();
        let newV2_x = hPos.x + eval(posInfo.xAxis);
        let newV2_y = hPos.y + eval(posInfo.yAxis);
        return cc.p(newV2_x, newV2_y);
    },

    //子弹灭亡
    bulletDied(nodeinfo) {
        //回收节点
        let poolName = nodeinfo.getComponent('bullet').poolName;
        D.common.backObjPool(this, poolName, nodeinfo);
    }
});
