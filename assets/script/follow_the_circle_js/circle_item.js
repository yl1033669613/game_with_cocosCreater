const FADESPEED = 200;
cc.Class({
    extends: cc.Component,
    properties: {
        drawCtn: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        this.ctx = this.drawCtn.getComponent(cc.Graphics);
        this.drawCircleItem(1, 12, 20);
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchHandle, this)
    },
    touchHandle(e) {
        console.log(1111)
    }, 
    drawCircleItem(color, borderR, centerR){
        this.ctx.clear();
        this.ctx.circle(20, 20, borderR);
        this.ctx.stroke();
        this.ctx.close();
        // this.ctx.fillColor = cc.Color(color);
        this.ctx.circle(20, 20, centerR);
        this.ctx.fill()
    },
    drawCircleItemAnimation(finBorderR, finCenterR, speed, dt){

    },
    update (dt) {

    }
})
