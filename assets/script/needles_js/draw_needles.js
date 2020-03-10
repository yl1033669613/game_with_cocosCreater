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
        },
        isRotate: true,
        speed: 10
    },
    onLoad() {
        this.ctx = this.needleDrawContent.getComponent(cc.Graphics);
        this.startRotate = 0;
        this.rotateAniObj = '';
    },
    start() {
        this.ctx.moveTo(9, 0);
        this.ctx.lineTo(9, 80);
        this.ctx.stroke();
        this.ctx.circle(9, 9, 9);
        this.ctx.fill();
        this.rotateAniObj = this.numTextRotate();
    },
    numTextRotate() {
        if (this.isRotate) {
            let rotate = cc.tween(this.numText).by(this.speed, { angle: -360 }).repeatForever().start();
            return rotate;
        }
    },
    stopNeedleAction() {
        if (this.rotateAniObj) this.rotateAniObj.stop()
    }
})
