const D = require('globals');

let gameState = cc.Enum({
    none: 0,
    start: 1,
    stop: 2
});
let common = cc.Class({
    extends: cc.Component,
    properties: {

    },
    statics: {
        gameState
    },
    onLoad() {
        D.commonInfo = common;
        D.common = this;
    },
    //批量初始化对象池 
    batchInitObjPool(thisO, objArray) {
        for (let i = 0; i < objArray.length; i++) {
            let objinfo = objArray[i];
            this.initObjPool(thisO, objinfo);
        }
    },
    //初始化对象池
    initObjPool(thisO, objInfo) {
        let name = objInfo.name;
        let poolName = name + 'Pool';
        thisO[poolName] = new cc.NodePool();
        let initPoolCount = objInfo.initPoolCount;
        for (let i = 0; i < initPoolCount; ++i) {
            let nodeO = cc.instantiate(objInfo.prefab);
            thisO[poolName].put(nodeO);
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
    backObjPool(thisO, poolName, nodeinfo) {
        thisO[poolName].put(nodeinfo);
    }
})
