cc.Class({
    extends: cc.Component,
    properties: {
        initBorderR: 12,
        initCenterR: 20,
        fadeSpeed: 0.085,
        finBorderR: 80,
        itemInitCount: 2,
        cirHideMul: .5,
        drawCtn: {
            default: null,
            type: cc.Node
        },
        centerNum: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        this.isTouch = false;
        this.circleActive = true;
        this.color = '';
        this.tapNum = 1;
        this.animationCircleR = null;
        this.circleGroupO = cc.find('Canvas/ftcGameComtainer/circleGroup').getComponent('circle_group');
        this.ctx = this.drawCtn.getComponent(cc.Graphics);
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchHandle, this);
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.isCollision = false;
    },
    itemCircleInit(color, tapNum) {
        this.isTouch = false;
        this.circleActive = true;
        this.color = color;
        this.tapNum = tapNum;
        this.itemCount = this.itemInitCount;
        this.centerNum.opacity = 255;
        this.centerNum.getComponent(cc.Label).string = this.tapNum;
        this.circleMoveObj = {
            angle: this.random(0, Math.PI * 2),
            tickMax: this.random(50, 400),
            tick: 0
        };
        this.drawCircleItem(this.color, this.initBorderR, this.initCenterR)
    },
    itemCircleInitCount(num) {
        this.itemCount = this.itemCount + num * this.cirHideMul;
        this.circleCountCb = function(e) {
            this.circleActive = false;
            this.noTouchHideAnimation()
        }.bind(this);
        this.scheduleOnce(this.circleCountCb, this.itemCount);
    },
    touchHandle(e) {
        if (!this.circleGroupO.circlesCreateState) {
            if (this.tapNum > 0) {
                this.tapNum--;
                this.centerNum.getComponent(cc.Label).string = this.tapNum
            };
            if (this.circleActive && this.tapNum == 0) {
                this.hideCenterNum();
                this.isTouch = true;
                this.circleActive = false;
                this.unschedule(this.circleCountCb);
                this.circleGroupO.updateCircleGroup(this.color)
            }
        }
    },
    drawCircleItem(color, borderR, centerR, opc) {
        let currColor = color.split('/');
        this.ctx.clear();
        this.ctx.strokeColor = new cc.Color(currColor[0], currColor[1], currColor[2], opc);
        this.ctx.lineWidth = 8;
        this.ctx.circle(20, 20, borderR);
        this.ctx.stroke();
        this.ctx.lineWidth = 1;
        this.ctx.circle(20, 20, centerR + 2);
        this.ctx.stroke();
        this.ctx.close();
        this.ctx.fillColor = new cc.Color(currColor[0], currColor[1], currColor[2], currColor[3]);
        this.ctx.circle(20, 20, centerR);
        this.ctx.fill()
    },
    // 点击动画
    drawCircleItemAnimationTouched(currBR, currCR, currOpc) {
        let bR = currBR,
            cR = currCR,
            opc = currOpc;
        bR += (this.finBorderR - bR) * this.fadeSpeed;
        cR -= cR * this.fadeSpeed;
        opc -= opc * this.fadeSpeed;
        this.drawCircleItem(this.color, bR, cR, opc);
        if (bR < this.finBorderR - 0.1) {
            return {
                bR: bR,
                cR: cR,
                opc: opc
            }
        } else {
            this.isTouch = false;
            this.removeThisCircle();
            return ''
        }
    },
    //非点击消失动画
    noTouchHideAnimation() {
        this.unschedule(this.circleCountCb);
        this.circleGroupO.updateCircleGroup(this.color);
        let action = cc.sequence(cc.scaleTo(1.1, 0, 0).easing(cc.easeExponentialOut(1.1)), cc.callFunc(() => {
            this.removeThisCircle();
        }, this));
        this.node.runAction(action)
    },
    hideCenterNum() {
        this.centerNum.runAction(cc.fadeOut(.2))
    },
    removeThisCircle() {
        this.circleGroupO.backObjPool(this.node);
    },
    updateCirclesPos() {
        let parentW = this.node.parent.width,
            parentH = this.node.parent.height;
        this.circleMoveObj.tick++;
        this.node.x += Math.cos(this.circleMoveObj.angle) * 0.2;
        this.node.y += Math.sin(this.circleMoveObj.angle) * 0.2;

        if (this.node.x < -parentW / 2 + this.node.width / 2) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'left')
        } else if (this.node.x > parentW / 2 - this.node.width / 2) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'right')
        };
        if (this.node.y < -parentH / 2 + this.node.height / 2) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'bottom')
        } else if (this.node.y > parentH / 2 - this.node.height / 2) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'top')
        };
        if (this.circleMoveObj.tick > this.circleMoveObj.tickMax) {
            this.circleMoveObj.angle = this.random(0, Math.PI * 2);
            this.circleMoveObj.tick = 0;
            this.circleMoveObj.tickMax = this.random(100, 600);
        }
    },
    getWallCollisionDir(ang, wallType) { //获取撞墙之后的角度
        if (ang == 0) {
            return Math.PI
        } else if (ang == Math.PI) {
            return 0
        } else if (ang == 2 * Math.PI) {
            return Math.PI
        };
        if (wallType == 'left' || wallType == 'right') {
            if (ang < Math.PI) {
                return Math.PI - ang
            } else {
                return 3 * Math.PI - ang
            }
        } else {
            return 2 * Math.PI - ang
        }
    },
    onCollisionEnter(other, self) {
        if (this.circleMoveObj.angle < Math.PI) {
            this.circleMoveObj.angle = Math.PI + this.circleMoveObj.angle
        } else {
            this.circleMoveObj.angle = this.circleMoveObj.angle - Math.PI
        };
        this.isCollision = true
    },
    random(min, max) { //获取随机数
        return Math.random() * (max - min) + min;
    },
    update(dt) {
        if (this.isTouch) {
            let fBR = this.animationCircleR ? this.animationCircleR.bR : this.initBorderR,
                fCR = this.animationCircleR ? this.animationCircleR.cR : this.initCenterR,
                opc = this.animationCircleR ? this.animationCircleR.opc : 255;
            this.animationCircleR = this.drawCircleItemAnimationTouched(fBR, fCR, opc);
        };
        if (this.circleActive) {
            this.updateCirclesPos()
        }
    }
})
