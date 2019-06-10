cc.Class({
    extends: cc.Component,
    properties: {
        obstaclePfb: {
            default: null,
            type: cc.Prefab
        },
        obstacleCount: 0
    },
    onLoad() {
        this.obstacleInstance = [];
        // 判断是否在蛇身上
        this.isOnSnake = true;

        // snake
        this.snake = this.node.getComponent("snake").snakeArray;

        // 初始生成障碍物 
        if (this.obstacleCount)
            for (let i = 0; i < this.obstacleCount; i++) this.createObstacle();
    },
    // 根据范围获取随机数
    getNumberInRange(min, max) {
        let range = max - min;
        let r = Math.random() * 2 - 1;
        return Math.round(r * range + min);
    },
    createObstacle() {
        this.isOnSnake = true;
        let indexX, indexY, pointArr = [];
        let obLength = Math.floor(Math.random() * 2);

        while (this.isOnSnake) {
            //执行后先将判定条件设置为false，如果判定不重合，则不会再执行下列语句
            this.isOnSnake = false;
            indexX = this.getNumberInRange(0, this.node.width / 30 - 1) * 15;
            indexY = this.getNumberInRange(0, this.node.height / 30 - 1) * 15;
            let aX = indexX,
                aY = indexY;
            for (let i = 0; i < obLength + 1; i++) {
                if (i % 2 === 0) {
                    aX = indexX;
                    aY = aY - 15;
                };
                aX = aX + 15;
                for (let v = 0; v < this.snake.length; v++) {
                    if (this.snake[v].x == aX && this.snake[v].y == aY) {
                        this.isOnSnake = true;
                        break;
                    }
                };
                if (aX < -(this.node.width / 2 - 30) || aX > (this.node.width / 2 - 30) || aY < -(this.node.height / 2 - 30) || aY > (this.node.height / 2 - 30)) this.isOnSnake = true;
                if (this.isOnSnake) break;
                let p = {
                    x: aX,
                    y: aY
                };
                pointArr.push(p);
            };
            if (this.isOnSnake) pointArr = [];
        };
        for (let i = 0; i < pointArr.length; i++) {
            let b = cc.instantiate(this.obstaclePfb);
            this.node.addChild(b);
            b.setPosition(cc.v2(pointArr[i].x, pointArr[i].y));
            this.obstacleInstance.push(b);
        }
    }
})
