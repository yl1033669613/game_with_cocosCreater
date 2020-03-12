cc.Class({
    extends: cc.Component,
    properties: {
        speed: 2, //未到达target的时的初始速度
        acceleration: 1.03, //加速度
        targetRadius: 1, //target 初始半径

        friction: 0.9, //阻力系数
        gravity: -1.3, //粒子重力系数
    },
    onLoad() {
        this.parent = this.node.parent.getComponent('firework_init_js');
        this.canvasCtx = this.node.getComponent(cc.Graphics);
        this.width = this.node.width;
        this.height = this.node.height;

        this.x = this.sx = this.width / 2;
        this.y = this.sy = 0;
        this.tx = this.parent.finger.down ? this.parent.finger.x : this.random(this.width * 0.05, this.width * 0.95);
        this.ty = this.parent.finger.down ? this.parent.finger.y : this.random(this.height * 0.5, this.height * 0.9);

        this.fireworksBodycolorRandom = this.colorRandom(); //随机颜色

        this.distanceToTarget = this.calculateDistance(this.x, this.y, this.tx, this.ty); //起始点与target点的直线距离
        this.distanceTraveled = 0; //初始状态移动的距离

        // 坐标数组
        this.coordinates = [];
        for (let i = 0; i < 3; i++) this.coordinates.push([this.x, this.y]);

        this.angle = Math.atan2(this.ty - this.y, this.tx - this.x); //夹角
        this.targetDirection = true;
        this.reachTarget = false; //是否到达目标

        // particle 粒子数组
        this.particles = [];
    },
    // 每帧更新函数
    fireworksBodyUpdate() {
        // 跟新坐标arr
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        // target 圆大小变化
        if (!this.targetDirection) {
            if (this.targetRadius < 8)
                this.targetRadius += 0.15
            else
                this.targetDirection = true
        } else {
            if (this.targetRadius > 1)
                this.targetRadius -= 0.15
            else
                this.targetDirection = false
        };
        // 更新速度 递增
        this.speed *= this.acceleration;
        //计算fireworks还需要走多远
        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = this.calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

        // 判断该fireworks是否到达target
        if (this.distanceTraveled >= this.distanceToTarget) {
            this.createParticles(this.tx, this.ty);
            this.reachTarget = true;
        } else {
            this.x += vx;
            this.y += vy;
        }
    },
    // 绘制函数
    fireworksBodyDraw(canvasCtx) {
        let lastCoordinate = this.coordinates[this.coordinates.length - 1];
        let color = new cc.Color({
            r: this.fireworksBodycolorRandom.r,
            g: this.fireworksBodycolorRandom.g,
            b: this.fireworksBodycolorRandom.b,
            a: 255
        });
        // Draw the rocket
        canvasCtx.clear();
        canvasCtx.moveTo(lastCoordinate[0], lastCoordinate[1]);
        canvasCtx.lineTo(this.x, this.y);
        canvasCtx.strokeColor = color;
        // Draw the target (pulsing circle)
        canvasCtx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
        canvasCtx.stroke();
    },
    //创建随机个数粒子
    createParticles(x, y) {
        let particleCount = Math.round(this.random(this.parent.particleMinNum, this.parent.particleMaxNum));
        while (particleCount--) {
            let coordinates = [];
            // 使用初始数据填充坐标数组
            for (let i = 0; i < 5; i++) {
                coordinates.push([x, y]);
            };
            this.particles.push({
                x: x, //target x
                y: y, //target y
                decay: this.random(2, 20), //点的最小透明度
                coordinates: coordinates, //坐标数组
                angle: this.random(0, Math.PI * 2), //随机角度
                speed: this.random(1, 10), //随机速度
                alpha: 255, //初始透明度
            })
        }
    },
    // 单个particle更新函数
    particleUpdate(index, item, canvasCtx) {
        // 更新坐标数组
        item.coordinates.pop();
        item.coordinates.unshift([item.x, item.y]);
        // 根据阻力而减速
        item.speed *= this.friction;
        // 根据速度和 gravity更新坐标位置
        item.x += Math.cos(item.angle) * item.speed;
        item.y += Math.sin(item.angle) * item.speed + this.gravity;
        // 透明度足够低时，淡出粒子，并移除它
        item.alpha -= item.decay;
        if (item.alpha <= item.decay) {
            this.particles.splice(index, 1);
            if (this.particles.length === 0) {
                this.node.destroy();
            };
            return;
        };
        //draw
        let lastCoordinate = item.coordinates[item.coordinates.length - 1];
        let changeRGB = this.randomColorInRange(this.fireworksBodycolorRandom, this.parent.range);
        if (index == this.particles.length - 1) { //渲染第一个粒子时清空前面的绘制
            canvasCtx.clear();
        };
        canvasCtx.moveTo(lastCoordinate[0], lastCoordinate[1]);
        canvasCtx.lineTo(item.x, item.y);
        canvasCtx.strokeColor = new cc.Color({
            r: changeRGB.r,
            g: changeRGB.g,
            b: changeRGB.b,
            a: item.alpha
        });
        canvasCtx.stroke();
    },
    randomColorInRange(rgbObj, range) {
        return {
            r: Math.round(this.random(rgbObj.r - range, rgbObj.r + range)),
            g: Math.round(this.random(rgbObj.g - range, rgbObj.g + range)),
            b: Math.round(this.random(rgbObj.b - range, rgbObj.b + range))
        }
    },
    calculateDistance(p1x, p1y, p2x, p2y) {
        let xDistance = p1x - p2x;
        let yDistance = p1y - p2y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    },
    // 获取随机颜色
    colorRandom() {
        return {
            r: Math.round(this.random(this.parent.range, 255 - this.parent.range)),
            g: Math.round(this.random(this.parent.range, 255 - this.parent.range)),
            b: Math.round(this.random(this.parent.range, 255 - this.parent.range))
        }
    },
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    update() {
        if (!this.reachTarget) {
            this.fireworksBodyDraw(this.canvasCtx);
            this.fireworksBodyUpdate();
        } else {
            let i = this.particles.length;
            while (i--) {
                this.particleUpdate(i, this.particles[i], this.canvasCtx);
            }
        }
    }
})