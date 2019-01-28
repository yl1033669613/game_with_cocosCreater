const Gdt = require('globals');

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
    },
    //批量初始化对象池 
    batchInitObjPool(ptO, objArray) {
        for (let i = 0; i < objArray.length; i++) {
            let objinfo = objArray[i];
            this.initObjPool(ptO, objinfo);
        }
    },
    //初始化对象池
    initObjPool(ptO, objInfo) {
        let name = objInfo.name,
            poolName = name + 'Pool';
        ptO[poolName] = new cc.NodePool();
        let initPoolCount = objInfo.initPoolCount;
        for (let i = 0; i < initPoolCount; ++i) {
            let nodeO = cc.instantiate(objInfo.prefab);
            ptO[poolName].put(nodeO);
        }
    },
    //生成节点
    genNewNode(pool, prefab, nodeParent) {
        let newNode = null;
        if (pool.size() > 0) {
            newNode = pool.get();
        } else {
            newNode = cc.instantiate(prefab);
        };
        nodeParent.addChild(newNode);
        return newNode
    },
    //放回对象池
    backObjPool(ptO, poolName, nodeinfo) {
        ptO[poolName].put(nodeinfo);
    }
})
