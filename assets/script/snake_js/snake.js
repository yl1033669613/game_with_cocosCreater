cc.Class({
    extends: cc.Component,

    properties: {
        // 触摸敏感距离
        DIFFPX: 15,
        colorArr:[cc.String],
        canvas: {
            default: null,
            type: cc.Node
        },
        snakebody: {
            default: null,
            type: cc.Prefab
        },
        snakeHead: {
            default: null,
            type: cc.Prefab
        },
        currScore: {
        	default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 创建蛇身体对象池
        this.snakeBodyPool = new cc.NodePool();
        let initCount = 3;
        for (let i = 0; i < initCount; ++i) {
            let snakeBody = cc.instantiate(this.snakebody); // 创建节点
            this.snakeBodyPool.put(snakeBody); // 通过 putInPool 接口放入对象池
        };

        //画出2个方块，的蛇身体
        this.snakeArray = []; //代表蛇身体的数组
        for (let i = 0; i < 1; i++) {
            let rect = null;
            // 先判断对象池中是否有空闲对象
            if (this.snakeBodyPool.size() > 0) {
                rect = this.snakeBodyPool.get();
            } else {
                rect = cc.instantiate(this.snakebody);
            };
            this.node.addChild(rect);
            rect.setPosition(cc.p(i * 15, 0)); //设置蛇身位置
            this.snakeArray.splice(0, 0, rect);
        };
        // 插入蛇头
        let snakeHead = cc.instantiate(this.snakeHead);
        this.node.addChild(snakeHead);
        snakeHead.setPosition(cc.p(15, 0)); //设置蛇头位置
        this.snakeArray.splice(0, 0, snakeHead);
        // 设置蛇头
        this.head = this.snakeArray[0];

        //给定初始位置向右
        this.direction = 39;

        // 触摸的初始位置
        this.touchX = 0;
        this.touchY = 0;

        // Game Obj
        this.game = this.canvas.getComponent("snake_game");

        // food
        this.food = this.node.getComponent("food");

        // 初始化玩家触摸事件
        this.initEvent();

        // 颜色变换顺序
        this.colorChange = 0;
    },

    //蛇的移动方式
    snakeMove() {
        //1、画一个灰色的方块，位置与蛇头重叠
        //2、将这个方块插到数组中蛇头后面一个的位置
        //3、砍去末尾的方块
        //4、将蛇头向设定方向移动一格
        let rect = null;
        // 先判断对象池中是否有空闲对象
        if (this.snakeBodyPool.size() > 0) {
            rect = this.snakeBodyPool.get();
        } else {
            rect = cc.instantiate(this.snakebody);
        };
        this.node.addChild(rect);
        rect.setPosition(cc.p(this.head.x, this.head.y))
        this.snakeArray.splice(1, 0, rect);

        //判断是否吃到食物
        //吃到则食物重新给位置，不砍去最后一节，即蛇变长
        //没吃到则末尾砍掉一节，即蛇长度不变
        if (this.isEat()) {
            this.game.score++;
            this.currScore.string = "score:" + this.game.score;
            this.food.releaseFood();
            this.food.foodPosShow();
        } else {
            let removePart = this.snakeArray.pop();
            this.snakeBodyPool.put(removePart);
        };

        //设置蛇头的运动方向，37 左，38 上，39 右，40 下

        switch (this.direction) {
            case 37:
                this.head.x -= this.head.width;
                break;
            case 38:
                this.head.y -= this.head.height;
                break;
            case 39:
                this.head.x += this.head.width;
                break;
            case 40:
                this.head.y += this.head.height;
                break;
            default:
                break;
        };

        // console.log(this.head.x)

        // gameover判定
        // 撞墙
        if (this.head.x >= (this.node.width - 15) / 2 || this.head.x < -this.node.width / 2 || this.head.y >= this.node.height / 2 || this.head.y < -this.node.height / 2) {
            this.game.gameOver = true;
        };
        // 撞自己，循环从1开始，避开蛇头与蛇头比较的情况
        for (var i = 1; i < this.snakeArray.length; i++) {
            if (this.snakeArray[i].x == this.head.x && this.snakeArray[i].y == this.head.y) {
                this.game.gameOver = true;
            };
        };
    },

    /**
     * 玩家响应手指的触摸事件
     */
    initEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            let startPoint = e.getLocation();

            let x = startPoint.x;
            let y = startPoint.y;

            this.touchX = x;
            this.touchY = y;
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            let EndPoint = e.getLocation();

            let x = EndPoint.x;
            let y = EndPoint.y;

            let diffX = x - this.touchX;
            let diffY = y - this.touchY;

            if (diffX <= -this.DIFFPX && Math.abs(diffX) >= Math.abs(diffY)) {

                if (this.direction !== 39) {
                    this.direction = 37
                }
            } else if (diffX >= this.DIFFPX && Math.abs(diffX) >= Math.abs(diffY)) {

                if (this.direction !== 37) {
                    this.direction = 39
                }
            } else if (diffY <= -this.DIFFPX && Math.abs(diffY) > Math.abs(diffX)) {

                if (this.direction !== 40) {
                    this.direction = 38
                }
            } else if (diffY >= this.DIFFPX && Math.abs(diffY) > Math.abs(diffX)) {

                if (this.direction !== 38) {
                    this.direction = 40
                }
            }
        }, this)
    },

    //判定吃到食物，即蛇头坐标与食物坐标重合
    isEat() {
        if (this.head.x == this.food.foodX && this.head.y == this.food.foodY) {
            return true;
        } else {
            return false;
        };
    },

    update (dt){
 		
    }
});
