cc.Class({
    extends: cc.Component,
    properties: {
        foodPrefab: {
            default: null,
            type: cc.Prefab
        }
    },
    onLoad() {
        // 创建食物对象池
        this.foodPool = new cc.NodePool();
        const initCount = 3;
        for (let i = 0; i < initCount; ++i) {
            let food = cc.instantiate(this.foodPrefab); // 创建节点
            this.foodPool.put(food);
        };

        this.foodInstance = null;

        // 判断是否在蛇身上flag
        this.isOnSnake = true;

        // snake
        this.snake = this.node.getComponent("snake").snakeArray;

        // 障碍物
        this.obstacleArr = this.node.getComponent("obstacle").obstacleInstance;

        // 食物显示后的位置
        this.foodX = 0;
        this.foodY = 0;

        // 初始显示一个食物
        this.foodPosShow();
    },
    // 根据范围获取随机数
    getNumberInRange(min, max) {
        let range = max - min;
        let r = Math.random() * 2 - 1;
        return Math.round(r * range + min);
    },
    //设置食物出现的随机位置
    foodPosShow() {
        this.isOnSnake = true;
        let indexX, indexY;
        while (this.isOnSnake) {
            this.isOnSnake = false;
            indexX = this.getNumberInRange(0, this.node.width / 30 - 1);
            indexY = this.getNumberInRange(0, this.node.height / 30 - 1);
            // 先判断位置是否重合
            for (let i = 0; i < this.snake.length; i++) {
                if (this.snake[i].x == indexX * 15 && this.snake[i].y == indexY * 15) {
                    //如果判定重合，将其设置为true，使随机数重给
                    this.isOnSnake = true;
                    break;
                }
            };
            // 判断食物是否与障碍物重合
            if (!this.isOnSnake) {
                for (let i = 0; i < this.obstacleArr.length; i++) {
                    if (indexX * 15 == this.obstacleArr[i].x && indexY * 15 == this.obstacleArr[i].y) {
                        //如果判定重合，将其设置为true，使随机数重给
                        this.isOnSnake = true;
                        break;
                    }
                }
            };
            if (indexX * 15 < -this.node.width / 2 + 30 || indexX * 15 > this.node.width / 2 - 30 || indexY * 15 < -this.node.height / 2 + 30 || indexY * 15 > this.node.height / 2 - 30) this.isOnSnake = true
        };
        // 判断对象池中是否有空闲对象
        if (this.foodPool.size() > 0) {
            this.foodInstance = this.foodPool.get();
        } else {
            this.foodInstance = cc.instantiate(this.foodPrefab);
        };
        this.node.addChild(this.foodInstance);
        this.foodInstance.setPosition(cc.v2(indexX * 15, indexY * 15));

        // 设置食物的位置
        this.foodX = indexX * 15;
        this.foodY = indexY * 15;
    },
    // 回收食物
    releaseFood() {
        this.foodPool.put(this.foodInstance);
        this.foodInstance = null;
    }
})
