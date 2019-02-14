const INITOBJPOOLCOUNT = 15;
const Gdt = require('global');

cc.Class({
    extends: cc.Component,
    properties: {
        circleItem: {
            default: null,
            type: cc.Prefab
        }
    },
    onLoad () {
        this.initObjPool();
        let aaa = this.genNewCircle(this.circleItemObjPool, this.circleItem, this.node);
        aaa.x = 0;
        aaa.y = 0;
    },
    initObjPool() {
        this.circleItemObjPool = new cc.NodePool();
        for (let i = 0; i < INITOBJPOOLCOUNT; ++i) {
            let nodeO = cc.instantiate(this.circleItem);
            this.circleItemObjPool.put(nodeO)
        }
    },
    genNewCircle(pool, prefab, nodeParent) {
        let newNode = null;
        if (pool.size() > 0) {
            newNode = pool.get();
        } else {
            newNode = cc.instantiate(prefab);
        };
        nodeParent.addChild(newNode);
        return newNode
    }
})

