cc.Class({
    extends: cc.Component,

    properties: {
        needleDrawContent: {
            default: null,
            type: cc.Node
        },
        numText: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.ctx = this.needleDrawContent.getComponent(cc.Graphics);
        this.startRotate = 0;
    },

    start () {
        this.ctx.moveTo(9, 0);
        this.ctx.lineTo(9, 80);
        this.ctx.stroke();
        this.ctx.circle(9, 9, 9);
        this.ctx.fill();

        this.numTextRotate();
    },

    numTextRotate (){
        let rotate = cc.repeatForever(cc.sequence(cc.rotateBy(0, 0), cc.rotateBy(8, -360)));
        this.numText.runAction(rotate);
    }
});
