module.exports = {
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
        return newNode;
    },
    //放回对象池
    backObjPool(ptO, poolName, nodeinfo) {
        ptO[poolName].put(nodeinfo);
    },
    //获取随机数
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
};
