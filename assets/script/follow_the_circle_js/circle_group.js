const INITOBJPOOLCOUNT = 15;
const COLORLIST = ['255/0/0/255', '255/144/0/255', '255/255/0/255', '0/255/0/255', '0/255/255/255', '0/0/255/255', '114/0/255/255'];
const CIRCLER = 20;
const Gdt = require('global');

cc.Class({
    extends: cc.Component,
    properties: {
        intervalMul: 0.5,
        tapMax: 5,
        circleItem: {
            default: null,
            type: cc.Prefab
        }
    },
    onLoad() {
        this.circlesCreateState = false;
        this.circleGroup = [];
        this.initObjPool();
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
    },
    backObjPool(nodeinfo) {
        this.circleItemObjPool.put(nodeinfo);
    },
    getRandomCircles() {
        let self = this;
        this.circlesCreateState = true;
        let circlesNum = Math.floor(Math.random() * (COLORLIST.length + 0.4 - 3) + 3);
        let result = [],
            currArr = COLORLIST.slice(0);
        for (let i = 0; i < circlesNum; i++) {
            let ran = Math.floor(Math.random() * (COLORLIST.length - i));
            result.push(currArr[ran]);
            currArr[ran] = currArr[COLORLIST.length - i - 1];
        };
        let count = 0;
        while (count < circlesNum) {
            let x = cc.randomMinus1To1() * (self.node.width / 2 - (CIRCLER + 2)),
                y = cc.randomMinus1To1() * (self.node.height / 2 - (CIRCLER + 2) - 40);
            let isOverlap = false,
                limitDst = Math.sqrt(2 * Math.pow(CIRCLER * 2, 2));
            for (let i = 0; i < self.circleGroup.length; i++) {
                let currDst = Math.abs(Math.sqrt(Math.pow(x - self.circleGroup[i].x, 2) + Math.pow(y - self.circleGroup[i].y, 2)));
                if (currDst < limitDst) {
                    isOverlap = true;
                    break;
                }
            };
            if (!isOverlap) {
                self.circleGroup.push({ color: result[count], x: x, y: y })
                count++;
            }
        };
        for (let i = 0; i < self.circleGroup.length; i++) {
            self.scheduleOnce(() => {
                let item = self.genNewCircle(self.circleItemObjPool, self.circleItem, self.node);
                let pos = cc.v2(self.circleGroup[i].x, self.circleGroup[i].y);
                item.setPosition(pos);
                item.scale = 0;
                let itemObj = item.getComponent('circle_item'),
                    randomNum = Math.floor(Math.random() * (this.tapMax - 1) + 1);
                itemObj.itemCircleInit(self.circleGroup[i].color, randomNum);
                let action = cc.scaleTo(1.1, 1, 1).easing(cc.easeExponentialOut(1.1));
                item.runAction(action);
                if (i == self.circleGroup.length - 1) {
                    this.circlesCreateState = false;
                    let childs = self.node.children;
                    for (let v = 0; v < childs.length; v++) {
                        childs[v].getComponent('circle_item').itemCircleInitCount(v);
                    }
                }
            }, (i + 1) * this.intervalMul)
        }
    },
    updateCircleGroup(color) {
        for (let i = 0; i < this.circleGroup.length; i++) {
            if (this.circleGroup[i].color == color) {
                this.circleGroup.splice(i, 1)
            }
        };
        if (this.circleGroup.length == 0) {
            this.getRandomCircles()
        }
    }
})
