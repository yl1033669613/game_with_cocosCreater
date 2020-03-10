cc.Class({
    extends: cc.Component,
    properties: {
        score: 0,
        gameContainer: {
            default: null,
            type: cc.Node
        },
        gameInfo: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() { // 设置游戏容器宽高
        this.gameContainer.width = this.node.width;
        this.gameContainer.height = this.node.height;
        // 蛇初始移动速度
        this.snakeMoveSpeed = 12;
        // 游戏结束
        this.gameOver = false;
        // frame
        this.frames = 0;
        // snake 
        this.snake = this.gameContainer.getComponent("snake");
    },
    showGameInfo() {
        this.gameInfo.active = true;
        this.gameInfo.opacity = 1;
        this.gameInfo.runAction(
            cc.fadeIn(0.2)
        )
    },
    // called every frame
    update(dt) {
        // 判断游戏是否结束
        if (this.gameOver) {
            if (!this.gameInfo.active) this.showGameInfo();
            return
        };
        // 蛇移动速度增加
        switch (this.score) {
            case 3:
                this.snakeMoveSpeed = 10;
                break;
            case 6:
                this.snakeMoveSpeed = 9;
                break;
            case 10:
                this.snakeMoveSpeed = 8;
                break;
            case 50:
                this.snakeMoveSpeed = 7;
                break;
            case 80:
                this.snakeMoveSpeed = 6;
                break;
            case 100:
                this.snakeMoveSpeed = 7;
                break;
            case 120:
                this.snakeMoveSpeed = 8;
                break;
            case 200:
                this.snakeMoveSpeed = 9;
                break;
            case 250:
                this.snakeMoveSpeed = 8;
                break;
            case 280:
                this.snakeMoveSpeed = 9;
                break;
            case 330:
                this.snakeMoveSpeed = 8;
                break;
            case 380:
                this.snakeMoveSpeed = 7;
                break;
            case 400:
                this.snakeMoveSpeed = 9;
                break;
            case 450:
                this.snakeMoveSpeed = 8;
                break;
        };
        this.frames++;
        if (this.frames % this.snakeMoveSpeed === 0) this.snake.snakeMove();
    }
})
