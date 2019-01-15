cc.Class({
    extends: cc.Component,

    properties: {
        circlesNum: 10,
        r: 163,
        g: 163,
        b: 163,
        type: 1
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.ctx = this.node.getComponent(cc.Graphics);
        this.circles = [];
        this.speed = 1.5;
        this.tick = 0;
        for (let i = 0; i < this.circlesNum; i++) { //生成随机属性的circle 对象
            let obj = {
                cx: this.random(this.node.width * 0.05, this.node.width * 0.95),
                cy: this.random(this.node.height * 0.05, this.node.height * 0.95),
                angle: this.random(0, Math.PI * 2),
                r: this.random(1, 20),
                tickMax: this.random(50, 400),
                tick: 0,
                alpha: this.random(10, 70)
            };
            this.circles.push(obj);
        }
    },

    createCircle(circleObj) {
        this.ctx.arc(circleObj.cx, circleObj.cy, circleObj.r, 0, Math.PI * 2);
        this.ctx.fillColor = new cc.Color(this.r, this.g, this.b, circleObj.alpha);
        this.ctx.fill();
    },

    updateDirection(item) { //更新方向
        item.tick++;
        item.cx += Math.cos(item.angle) * this.speed / 10;
        item.cy += Math.sin(item.angle) * this.speed / 10;
        if (item.cx < 0) {
            item.cx = 0;
        } else if (item.cx > this.node.width) {
            item.cx = this.node.width
        };
        if (item.cy < 0) {
            item.cy = 0;
        } else if (item.cy > this.node.height) {
            item.cy = this.node.height
        };
        if (item.tick > item.tickMax) {
            item.angle = this.random(0, Math.PI * 2);
            item.tick = 0;
            item.tickMax = this.random(50, 400);
        };
        this.createCircle(item);
    },

    random(min, max) { //获取随机数
        return Math.random() * (max - min) + min;
    },

    update(dt) {
        this.ctx.clear();
        for (var i = 0; i < this.circles.length; i++) {
            this.updateDirection(this.circles[i]);
        }
    }
});
