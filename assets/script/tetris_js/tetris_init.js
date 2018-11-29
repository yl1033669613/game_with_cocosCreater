const tets = require('./tetrominoes.js');
const DROPSPEED = 500;
const ROW = 20;
const COL = 10,
    COLUMN = 10;
const SQ = 18,
    squareSize = 18;
const VACANT = "61/60/60/255"; // color of an empty square

cc.Class({
    extends: cc.Component,

    properties: {
        theBoard: {
            type: cc.Node,
            default: null
        },
        scoreLabel: {
            type: cc.Label,
            default: null
        },
        gameOverInfo: {
            type: cc.Node,
            default: null
        },
        overScoreLabel: {
            type: cc.Label,
            default: null
        },
        bestScoreLabel: {
            type: cc.Label,
            default: null
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.ctx = this.theBoard.getComponent(cc.Graphics);
        this.board = [];

        this.PIECES = [
            [tets.Z, "236/38/66/255"],
            [tets.S, "19/171/19/255"],
            [tets.T, "221/219/61/255"],
            [tets.O, "44/39/234/255"],
            [tets.L, "234/131/39/255"],
            [tets.I, "39/234/232/255"],
            [tets.J, "128/57/209/255"]
        ];

        this.fps = 0;

        this.dropSpeed = DROPSPEED;

        this.score = 0;

        this.gameOver = false;

        //pieces pos
        this.x = 3;
        this.y = -2;
        this.tetromino = '';
        this.color = '';
        this.tetrominoN = 0; // we start from the first pattern
        this.activeTetromino = '';

        // wx cloud
        this.globalUser = cc.director.getScene().getChildByName('gameUser').getComponent('game_user_js');
        this.bestScore = this.globalUser.userGameInfo.tetrisBestScore || 0;
        this.db = wx.cloud.database();
        //判断数据库字段 不存在则先更新字段
        if (typeof this.globalUser.userGameInfo.tetrisBestScore != 'number') {
            this.requestDbTetrisBestScore();
        }
    },

    //draw board
    drawBoard() {
        this.ctx.clear();
        for (let r = 0; r < ROW; r++) {
            for (let c = 0; c < COL; c++) {
                this.drawSquare(c, r, this.board[r][c]);
            }
        }
    },

    drawSquare(x, y, color) {
        let c = color.split('/');
        let col = new cc.Color({r: parseInt(c[0]), g: parseInt(c[1]), b: parseInt(c[2]), a: parseInt(c[3])});
        this.ctx.fillColor = col;
        this.ctx.rect((x * SQ) + (2 * x), (SQ * ROW + 22) - ((y * SQ) + (2 * y)), SQ, SQ);
        this.ctx.stroke();
        this.ctx.fill();
    },

    //随机获取块
    randomPiece() {
        let r = Math.floor(Math.random() * this.PIECES.length)

        this.x = 3;
        this.y = -2;
        this.tetrominoN = 0;
        this.tetromino = this.PIECES[r][0];
        this.color = this.PIECES[r][1];
        this.activeTetromino = this.tetromino[this.tetrominoN];
    },

    // 填充
    fill(color) {
        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino.length; c++) {
                // we draw only occupied squares
                if (this.activeTetromino[r][c]) {
                    this.drawSquare(this.x + c, this.y + r, color);
                }
            }
        }
    },

    // 绘制
    draw() {
        this.fill(this.color);
    },

    // 绘制空格
    unDraw() {
        this.fill(VACANT);
    },

    moveDown() {
        if (!this.collision(0, 1, this.activeTetromino)) {
            this.unDraw();
            this.y++;
            this.draw();
        } else {
            // lock and generate a new one
            this.lock();
            this.randomPiece();
        }
    },

    // move Right
    moveRight() {
        if (!this.collision(1, 0, this.activeTetromino)) {
            this.unDraw();
            this.x++;
            this.draw();
        }
    },

    // move Left 
    moveLeft() {
        if (!this.collision(-1, 0, this.activeTetromino)) {
            this.unDraw();
            this.x--;
            this.draw();
        }
    },

    // rotate the piece
    rotate() {
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
        let kick = 0;

        if (this.collision(0, 0, nextPattern)) {
            if (this.x > COL / 2) {
                // 到达右边界
                kick = -1; // we need to move the piece to the left
            } else {
                // 到达右左边界
                kick = 1; // we need to move the piece to the right
            }
        }

        if (!this.collision(kick, 0, nextPattern)) {
            this.unDraw();
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
    },

    lock() {
        this.dropSpeed = DROPSPEED;

        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino.length; c++) {
                // 跳过空格
                if (!this.activeTetromino[r][c]) {
                    continue;
                }
                // 当形状触碰到board 上边界时游戏结束
                if (this.y + r < 0) {
                    this.gameOver = true;
                    if (this.score > this.bestScore) {
                        this.bestScore = this.score;
                        this.requestDbTetrisBestScore();
                    };
                    this.showGameOverInfo();
                    break;
                }
                // 将方块写入board数组中  表示锁定
                this.board[this.y + r][this.x + c] = this.color;
            }
        }
        // 移除填满的行
        for (let r = 0; r < ROW; r++) {
            let isRowFull = true;
            for (let c = 0; c < COL; c++) {
                isRowFull = isRowFull && (this.board[r][c] != VACANT);
            }
            if (isRowFull) {
                // 当一行被填满时将 上面的方块向下移动
                for (let y = r; y > 1; y--) {
                    for (let c = 0; c < COL; c++) {
                        this.board[y][c] = this.board[y - 1][c];
                    }
                }
                // 第一行之上没有更多了
                for (let c = 0; c < COL; c++) {
                    this.board[0][c] = VACANT;
                }
                // 更新分数
                this.score += 10;
            }
        }
        // 更新borad
        this.drawBoard();

        // 渲染分数
        this.scoreLabel.string = 'score:' + this.score;
    },

    //碰撞检测
    collision(x, y, piece) {
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece.length; c++) {
                // 空 则跳过
                if (!piece[r][c]) {
                    continue;
                }

                let newX = this.x + c + x;
                let newY = this.y + r + y;

                if (newX < 0 || newX >= COL || newY >= ROW) {
                    return true;
                }
                // skip newY < 0; board[-1] will crush our game
                if (newY < 0) {
                    continue;
                }
                // 判断是是否为非空格
                if (this.board[newY][newX] != VACANT) {
                    return true;
                }
            }
        }
        return false;
    },

    //玩家触控
    initEvent() {
        let sx, sy, dx, dy;
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            let startPoint = e.getLocation();
            sx = startPoint.x;
            sy = startPoint.y;
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            let startPoint = e.getLocation();
            let ex = startPoint.x;
            let ey = startPoint.y;
            dx = ex - sx;
            dy = ey - sy;
        }, this)

        this.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            //根据横纵坐标位移判断滑动方向 up to rotate piece, left to left, right to right, down to down
            if (this.gameOver) return;
            if (dy > 30 && Math.abs(dy / dx) > 2) this.rotate();
            if (dy < -30 && Math.abs(dy / dx) > 2) {
                this.dropSpeed = 0;
                this.moveDown();
            };
            if (dx < -30 && Math.abs(dx / dy) > 2) this.moveLeft();
            if (dx > 30 && Math.abs(dx / dy) > 2) this.moveRight();
        }, this);
    },

    drop() {
        if (!this.gameOver) {
            this.moveDown();
        }
    },

    //保存最高得分 wx cloud
    requestDbTetrisBestScore(cb) {
        let self = this;
        self.db.collection('userGameInfo').where({
            _openid: self.globalUser.openid
        }).get({
            success: (res) => {
                self.db.collection('userGameInfo').doc(res.data[0]._id).update({
                    data: {
                        'tetrisBestScore': self.score,
                        'updateTime': self.db.serverDate()
                    },
                    success: (sc) => {
                        self.globalUser.setUserGameInfo('tetrisBestScore', self.score);
                        cb && cb();
                        console.log('保存成功')
                    }
                })
            }
        })
    },

    showGameOverInfo() {
        this.overScoreLabel.string = 'score: ' + this.score;
        this.bestScoreLabel.string = 'best score: ' + this.bestScore;

        this.gameOverInfo.active = true;
        this.gameOverInfo.opacity = 0;
        this.gameOverInfo.runAction(cc.sequence(
            cc.scaleTo(0, 0.9, 0.9),
            cc.spawn(cc.scaleTo(0.2, 1, 1), cc.fadeIn(0.3))
        ));
    },

    newGame() {
        this.gameOverInfo.active = false;
        this.fps = 0;
        this.dropSpeed = DROPSPEED;
        this.score = 0;
        this.gameOver = false;
        this.scoreLabel.string = 'score:' + this.score;

        for (let r = 0; r < ROW; r++) {
            this.board[r] = [];
            for (let c = 0; c < COL; c++) {
                this.board[r][c] = VACANT;
            }
        };
        this.drawBoard();
        this.randomPiece();
    },

    backList() {
        //游戏非game over时退出任然记录最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.requestDbTetrisBestScore(() => {
                cc.director.loadScene('startscene');
            })
        } else {
            cc.director.loadScene('startscene');
        }
    },

    start() {
        //create board
        for (let r = 0; r < ROW; r++) {
            this.board[r] = [];
            for (let c = 0; c < COL; c++) {
                this.board[r][c] = VACANT;
            }
        };
        this.scoreLabel.string = 'score:' + this.score;
        this.drawBoard();
        this.randomPiece();
        this.initEvent()
    },

    update(dt) {
        this.fps += dt * 1000;
        if (this.fps > this.dropSpeed) {
            this.fps = 0;
            this.drop();
        }
    },
});
