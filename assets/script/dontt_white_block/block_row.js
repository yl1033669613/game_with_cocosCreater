cc.Class({
    extends: cc.Component,
    properties: {
        colItems: {
            default: [],
            type: cc.Node
        }
    },
    onLoad() {
        let visSize = cc.director.getVisibleSize();
        this.node.width = visSize.width;
        this.node.height = visSize.height / 4;
        let itemW = this.node.width / 4;
        for (let i = 0; i < this.colItems.length; i++) {
            this.colItems[i].setPositionX(i * itemW + 1);
            this.colItems[i].width = itemW - 2
        };
        this.gm = this.node.parent.getComponent('dtwb_game')
    },
    update(dt) {
        this.checkPos()
    },
    init(isFirst) {
        this.state = 1; //1 未触发状态 2正确点击态
        this.redIdx = -1;
        this.blackIdx = this.getBlack();
        this.isFirst = isFirst;
        this.setNormal();
        if (isFirst) {
            this.colItems[this.blackIdx].children[0].active = true;
        }
    },
    getBlack() {
        let randomN = Math.floor(Math.random() * (this.colItems.length - .4));
        this.colItems[randomN].color = cc.Color.BLACK;
        return randomN
    },
    setBlockGray(idx) {
        let indexNode = this.colItems[idx];
        indexNode.runAction(cc.tintTo(.2, 134, 134, 134, 255));
    },
    setBlockRed(idx) {
        let indexNode = this.colItems[idx];
        indexNode.runAction(cc.tintTo(.2, 255, 0, 0, 255));
    },
    setNormal() {
        for (let i = 0; i < this.colItems.length; i++) {
            if (i == this.blackIdx) continue;
            this.colItems[i].color = cc.Color.WHITE;
        }
    },
    handleClick(e, idx) {
        let touchIdx = parseInt(idx);
        if (this.gm.gameState == 0 && this.isFirst && this.blackIdx == touchIdx) { //开始第一块时 限制必须为第一行正确块 保证第一次点击正确
            this.gm.gameState = 1;
            this.gm.startRowAction()
        };
        if (this.gm.gameState == 1) {
            if (this.blackIdx == touchIdx) {
                if (this.state == 1) {
                    this.state = 2;
                    this.setBlockGray(this.blackIdx);
                    this.gm.updateScore()
                }
            } else {
                this.gm.gameState = 2;
                this.redIdx = touchIdx;
                this.setBlockRed(this.redIdx);
                this.gm.gameOver()
            }
        }
    },
    checkPos() {
        if (this.gm.gameState == 1) {
            if (this.node.y <= 0) {
                if (this.state == 2) {
                    if (this.isFirst) {
                        this.colItems[this.blackIdx].children[0].active = false;
                    };
                    this.gm.rowNodeList.shift();
                    this.gm.backObjPool(this.node);
                    this.gm.createMoveRow(false)
                } else {
                    this.gm.gameState = 2;
                    this.gm.gameOver()
                }
            }
        }
    }
})
