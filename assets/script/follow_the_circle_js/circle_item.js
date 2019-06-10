cc.Class({
    extends: cc.Component,
    properties: {
        fadeSpeed: 0.085,
        circleMoveSpeed: 0.2,
        finBorderR: 95,
        itemInitCount: 3,
        cirHideMul: .8,
        planetR: 2.5,
        drawCtn: {
            default: null,
            type: cc.Node
        },
        centerNum: {
            default: null,
            type: cc.Label
        },
        drawPlanet: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        this.color = '';
        this.animationCircleR = null;

        this.circleGroupO = cc.find('Canvas/ftcGameComtainer/circleGroup').getComponent('circle_group');
        this.ctx = this.drawCtn.getComponent(cc.Graphics);
        this.planetCtx = this.drawPlanet.getComponent(cc.Graphics);
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchHandle, this);
        this.isCollision = false;
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },
    itemCircleInit(color, tapNum, initBorderR, initCenterR) {
        this.color = color;
        this.tapNum = tapNum;
        this.cirBorderR = initBorderR;
        this.cirCenterR = initCenterR;
        this.unscheduleAllCallbacks();

        this.isTouch = false;
        this.centerNum.node.opacity = 255;
        this.centerNum.string = this.tapNum;
        this.itemCount = this.itemInitCount;
        this.circleMoveObj = {
            angle: this.random(0, Math.PI * 2),
            tickMax: this.random(50, 400),
            tick: 0
        };
        this.planetArr = [];
        this.planetCtx.clear();
        for (let i = 0; i < this.tapNum; i++) {
            let obj = {
                ang: this.random(0, Math.PI * 2),
                speed: this.random(0.008, 0.03),
                r: this.cirCenterR + this.planetR + (i * this.planetR * 2) + 3,
                opc: 255 - (65 * i)
            };
            this.drawPlanetPoint(obj.ang, obj.r);
            this.planetArr.push(obj);
        };
        this.circleActive = true;
        this.drawCircleItem(this.color, this.cirBorderR, this.cirCenterR);
    },
    itemCircleInitCount(num) {
        this.itemCount = this.itemCount + num * this.cirHideMul;
        this.circleCountCb = function (e) {
            this.circleActive = false;
            this.noTouchHideAnimation();
        }.bind(this);
        this.scheduleOnce(this.circleCountCb, this.itemCount);
    },
    touchHandle(e) {
        if (!this.circleGroupO.circlesCreateState) {
            if (this.tapNum > 0) {
                this.tapNum--;
                this.planetArr.splice(this.planetArr.length - 1, 1);
                this.centerNum.string = this.tapNum;
            };
            if (this.circleActive && this.tapNum == 0) {
                this.planetCtx.clear();
                this.hideCenterNum();
                this.isTouch = true;
                this.circleActive = false;
                this.unschedule(this.circleCountCb);
                this.circleGroupO.updateCircleGroup(this.color, true);
            }
        }
    },
    drawCircleItem(color, borderR, centerR, opc) {
        let currColor = color.split('/').map(a => parseFloat(a)),
            centerPointY,
            centerPointX;
        centerPointX = centerPointY = 0;
        this.ctx.clear();
        this.ctx.strokeColor = new cc.Color(currColor[0], currColor[1], currColor[2], opc);
        this.ctx.lineWidth = 8;
        this.ctx.circle(centerPointX, centerPointY, borderR);
        this.ctx.stroke();
        this.ctx.lineWidth = 1;
        this.ctx.circle(centerPointX, centerPointY, centerR + 2);
        this.ctx.stroke();
        this.ctx.close();
        this.ctx.fillColor = new cc.Color(currColor[0], currColor[1], currColor[2], currColor[3]);
        this.ctx.circle(centerPointX, centerPointY, centerR);
        this.ctx.fill();
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
            };
        } else {
            this.isTouch = false;
            this.removeThisCircle(this.node);
            return '';
        }
    },
    //非点击消失动画
    noTouchHideAnimation(isMult) {
        this.unschedule(this.circleCountCb);
        if (!isMult) this.circleGroupO.updateCircleGroup(this.color, false);
        let action = cc.sequence(cc.scaleTo(1.1, 0, 0).easing(cc.easeExponentialOut(1.1)), cc.callFunc(() => {
            this.removeThisCircle(this.node);
        }, this));
        this.node.runAction(action);
    },
    hideCenterNum() {
        this.centerNum.node.runAction(cc.fadeOut(.2));
    },
    removeThisCircle(node) {
        this.circleGroupO.backObjPool(node);
    },
    updateCirclesPos() {
        let parentW = this.node.parent.width,
            parentH = this.node.parent.height;
        this.circleMoveObj.tick++;
        this.node.x += Math.cos(this.circleMoveObj.angle) * this.circleMoveSpeed;
        this.node.y += Math.sin(this.circleMoveObj.angle) * this.circleMoveSpeed;
        if (this.node.x < -parentW / 2 + this.node.width / 2) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'left');
        } else if (this.node.x > parentW / 2 - this.node.width / 2) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'right');
        };
        if (this.node.y < -parentH / 2 + this.node.height / 2) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'bottom');
        } else if (this.node.y > parentH / 2 - this.node.height) {
            this.circleMoveObj.angle = this.getWallCollisionDir(this.circleMoveObj.angle, 'top');
        };
        if (this.circleMoveObj.tick > this.circleMoveObj.tickMax) {
            this.circleMoveObj.angle = this.random(0, Math.PI * 2);
            this.circleMoveObj.tick = 0;
            this.circleMoveObj.tickMax = this.random(100, 600);
        }
    },
    getWallCollisionDir(ang, wallType) { //获取撞墙之后的角度
        if (ang == 0) {
            return Math.PI;
        } else if (ang == Math.PI) {
            return 0;
        } else if (ang == 2 * Math.PI) {
            return Math.PI;
        };
        if (wallType == 'left' || wallType == 'right') {
            if (ang < Math.PI) {
                return Math.PI - ang;
            } else {
                return 3 * Math.PI - ang;
            }
        } else {
            return 2 * Math.PI - ang;
        }
    },
    onCollisionEnter(other, self) {
        if (this.circleMoveObj.angle < Math.PI) {
            this.circleMoveObj.angle = Math.PI + this.circleMoveObj.angle;
        } else {
            this.circleMoveObj.angle = this.circleMoveObj.angle - Math.PI;
        };
        this.isCollision = true;
    },
    random(min, max) { //获取随机数
        return Math.random() * (max - min) + min;
    },
    drawPlanetPoint(ang, r, opc) {
        let currColor = this.color.split('/').map(a => parseFloat(a)),
            centerPX,
            centerPY = centerPX = 0,
            currX, currY;
        currX = centerPX + r * Math.cos(ang);
        currY = centerPY + r * Math.sin(ang);
        this.planetCtx.fillColor = new cc.Color(currColor[0], currColor[1], currColor[2], opc);
        this.planetCtx.circle(currX, currY, this.planetR);
        this.planetCtx.fill();
    },
    updatePlanetPointMove() {
        this.planetCtx.clear();
        for (let i = 0; i < this.planetArr.length; i++) {
            this.planetArr[i].ang += this.planetArr[i].speed;
            this.drawPlanetPoint(this.planetArr[i].ang, this.planetArr[i].r, this.planetArr[i].opc);
        }
    },
    update() { //circle实时的调用Graphics API 进行动画绘制，消耗大量性能不建议使用，最好的方法是只调用一次绘制利用js动作API操作组件
        if (this.isTouch) {
            let fBR = this.animationCircleR ? this.animationCircleR.bR : this.cirBorderR,
                fCR = this.animationCircleR ? this.animationCircleR.cR : this.cirCenterR,
                opc = this.animationCircleR ? this.animationCircleR.opc : 255;
            this.animationCircleR = this.drawCircleItemAnimationTouched(fBR, fCR, opc);
        };
        if (this.circleActive) {
            this.updateCirclesPos();
            this.updatePlanetPointMove();
        }
    }
})