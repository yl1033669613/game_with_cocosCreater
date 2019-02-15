const FADESPEED = 0.085,
    FINBORDERR = 70;
cc.Class({
    extends: cc.Component,
    properties: {
        initBorderR: 14,
        initCenterR: 20,
        itemInitCount: 20,
        drawCtn: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        this.isTouch = false;
        this.circleActive = true;
        this.color = '';
        this.animationCircleR = null;
        this.circleGroupO = cc.find('Canvas/ftcGameComtainer/circleGroup').getComponent('circle_group');
        this.ctx = this.drawCtn.getComponent(cc.Graphics);
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchHandle, this);
    },
    itemCircleInit (color){
        this.isTouch = false;
        this.circleActive = true;
        this.color = color;
        this.itemCount = this.itemInitCount;
        this.drawCircleItem(this.color, this.initBorderR, this.initCenterR)
    },
    itemCircleInitCount(num) {
        this.itemCount = this.itemCount + num;
        this.schedule(this.updateItemCircleCount, this.itemCount)
    },
    updateItemCircleCount() {
        this.itemCount--;
        if (this.itemCount == 0) {
            this.noTouchHideAnimation()
        }
    },
    touchHandle(e) {
        if (this.circleActive) {
            this.isTouch = true;
            this.circleActive = false;
            this.circleGroupO.updateCircleGroup(this.color)
        }
    }, 
    drawCircleItem(color, borderR, centerR, opc){
        let currColor = color.split('/');
        this.ctx.clear();
        this.ctx.strokeColor = new cc.Color(currColor[0], currColor[1], currColor[2], opc);
        this.ctx.circle(20, 20, borderR);
        this.ctx.stroke();
        this.ctx.close();
        this.ctx.fillColor = new cc.Color(currColor[0], currColor[1], currColor[2], currColor[3]);
        this.ctx.circle(20, 20, centerR);
        this.ctx.fill()
    },
    drawCircleItemAnimation(currBR, currCR, currOpc){
        let bR = currBR,
            cR = currCR,
            opc = currOpc;
        bR += (FINBORDERR - bR)*FADESPEED;
        cR -= cR*FADESPEED;
        opc -= opc*FADESPEED;
        this.drawCircleItem(this.color, bR, cR, opc);
        if (bR < FINBORDERR - 0.1) {
            return {
                bR: bR,
                cR: cR,
                opc: opc
            }
        } else {
            this.isTouch = false;
            this.unschedule(this.updateItemCircleCount);
            this.removeThisCircle();
            return ''
        }
    },
    //非点击消失动画
    noTouchHideAnimation() {
        this.unschedule(this.updateItemCircleCount);
        let action = cc.sequence(cc.scaleTo(1.1, 0, 0).easing(cc.easeExponentialOut(1.1)), cc.callFunc(() => {
            this.removeThisCircle();
        }, this));
        this.node.runAction(action)
    },
    removeThisCircle() {
        this.circleGroupO.backObjPool(this.node);
    },
    update (dt) {
        if (this.isTouch) {
            let fBR = this.animationCircleR ? this.animationCircleR.bR : this.initBorderR,
                fCR = this.animationCircleR ? this.animationCircleR.cR : this.initCenterR,
                opc = this.animationCircleR ? this.animationCircleR.opc : 255; 
            this.animationCircleR = this.drawCircleItemAnimation(fBR, fCR, opc);
        }
    }
})
