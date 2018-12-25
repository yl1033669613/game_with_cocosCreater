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
    // use this for initialization
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
    },
    //时间格式化
    timeFmt(time, fmt) {
        let o = {
            "M+": time.getMonth() + 1, //月份 
            "d+": time.getDate(), //日 
            "h+": time.getHours(), //小时 
            "m+": time.getMinutes(), //分 
            "s+": time.getSeconds(), //秒 
            "q+": Math.floor((time.getMonth() + 3) / 3), //季度 
            "S": time.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
})
