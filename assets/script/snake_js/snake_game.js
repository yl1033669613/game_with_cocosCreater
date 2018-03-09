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

    // use this for initialization
    onLoad() {
        // var tic = wx.getSystemInfoSync();
        // this.node.width = tic.windowWidth;
        // this.node.height = tic.windowHeight;

        // 设置游戏容器宽高
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

        this.showGameInfo(false);

        this.infoShowOnce = 0;
    },

    showGameInfo(bool) {
        this.gameInfo.active = bool;
        if (bool) {
            while(!this.infoShowOnce){
                this.infoShowOnce = 1;
                this.gameInfo.opacity = 0;
                this.gameInfo.runAction(
                    cc.fadeIn(0.2)
                )
            }
        }
    },

    // called every frame
    update(dt) {
        // 判断游戏是否结束
        if (this.gameOver) {
            this.showGameInfo(true);
            return;
        };
        // 蛇移动速度增加
        switch(this.score){
            case 5:
            this.snakeMoveSpeed = 10;
            break;
            case 10:
            this.snakeMoveSpeed = 9;
            break;
            case 20:
            this.snakeMoveSpeed = 8;
            break;
            case 30:
            this.snakeMoveSpeed = 7;
            break;
            case 50:
            this.snakeMoveSpeed = 6;
            break;
            case 80:
            this.snakeMoveSpeed = 5;
            break;
            case 120:
            this.snakeMoveSpeed = 4;
            break;
            case 150:
            this.snakeMoveSpeed = 3;
            break;
        };
        this.frames++;
        if (this.frames % this.snakeMoveSpeed === 0) {
            this.snake.snakeMove();
        }
    },
});
