const tets = require('./tetrominoes.js');

const ROW = 20;
const COL = 10,
    COLUMN = 10;
const SQ = 18,
    squareSize = 18;
const VACANT = "WHITE"; // color of an empty square

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
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.ctx = this.theBoard.getComponent(cc.Graphics);
        this.board = [];

        this.PIECES = [
            [tets.Z, "RED"],
            [tets.S, "GREEN"],
            [tets.T, "YELLOW"],
            [tets.O, "BLUE"],
            [tets.L, "BLUE"],
            [tets.I, "ORANGE"],
            [tets.J, "ORANGE"]
        ];

        this.fps = 0;

        this.dropSpeed = 800;

        this.score = 0;

        this.gameOver = false;

        //pieces pos
        this.x = 3;
        this.y = -2;
        this.tetromino = '';
        this.color = '';
        this.tetrominoN = 0; // we start from the first pattern
        this.activeTetromino = '';
    },

    drawBoard() {
        for (let r = 0; r < ROW; r++) {
            for (let c = 0; c < COL; c++) {
                this.drawSquare(c, r, this.board[r][c]);
            }
        }
    },

    drawSquare(x, y, color) {
        this.ctx.fillColor = cc.Color[color];
        this.ctx.rect((x * SQ) + (2 * x), (SQ * ROW + 22) - ((y * SQ) + (2 * y)), SQ, SQ);
        this.ctx.stroke();
        this.ctx.fill();
    },

    //随机获取块
    randomPiece() {
        let r = Math.floor(Math.random() * this.PIECES.length) // 0 -> 6

        this.x = 3;
        this.y = -2;
        this.tetrominoN = 0;
        this.tetromino = this.PIECES[r][0];
        this.color = this.PIECES[r][1];
        this.activeTetromino = this.tetromino[this.tetrominoN];
    },

    // fill function
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

    // draw a piece to the board
    draw() {
        this.fill(this.color);
    },

    // undraw a piece
    unDraw() {
        this.fill(VACANT);
    },

    moveDown() {
        if (!this.collision(0, 1, this.activeTetromino)) {
            this.unDraw();
            this.y++;
            this.draw();
        } else {
            // we lock the piece and generate a new one
            this.lock();
            this.randomPiece();
        }
    },

    // move Right the piece
    moveRight() {
        if (!this.collision(1, 0, this.activeTetromino)) {
            this.unDraw();
            this.x++;
            this.draw();
        }
    },

    // move Left the piece
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
                // it's the right wall
                kick = -1; // we need to move the piece to the left
            } else {
                // it's the left wall
                kick = 1; // we need to move the piece to the right
            }
        }

        if (!this.collision(kick, 0, nextPattern)) {
            this.unDraw();
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
    },

    lock() {
        this.dropSpeed = 800;

        for (let r = 0; r < this.activeTetromino.length; r++) {
            for (let c = 0; c < this.activeTetromino.length; c++) {
                // we skip the vacant squares
                if (!this.activeTetromino[r][c]) {
                    continue;
                }
                // pieces to lock on top = game over
                if (this.y + r < 0) {
                    console.log("Game Over");
                    this.gameOver = true;
                    break;
                }
                // we lock the piece
                this.board[this.y + r][this.x + c] = this.color;
            }
        }
        // remove full rows
        for (let r = 0; r < ROW; r++) {
            let isRowFull = true;
            for (let c = 0; c < COL; c++) {
                isRowFull = isRowFull && (this.board[r][c] != VACANT);
            }
            if (isRowFull) {
                // if the row is full
                // we move down all the rows above it
                for (let y = r; y > 1; y--) {
                    for (let c = 0; c < COL; c++) {
                        this.board[y][c] = this.board[y - 1][c];
                    }
                }
                // the top row board[0][..] has no row above it
                for (let c = 0; c < COL; c++) {
                    this.board[0][c] = VACANT;
                }
                // increment the score
                this.score += 10;
            }
        }
        // update the board
        this.drawBoard();

        // update the score
        this.scoreLabel.string = 'score:' + this.score;
    },

    collision(x, y, piece) {
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece.length; c++) {
                // if the square is empty, we skip it
                if (!piece[r][c]) {
                    continue;
                }
                // coordinates of the piece after movement
                let newX = this.x + c + x;
                let newY = this.y + r + y;

                // conditions
                if (newX < 0 || newX >= COL || newY >= ROW) {
                    return true;
                }
                // skip newY < 0; board[-1] will crush our game
                if (newY < 0) {
                    continue;
                }
                // check if there is a locked piece alrady in place
                if (this.board[newY][newX] != VACANT) {
                    return true;
                }
            }
        }
        return false;
    },

    newGame() {
        cc.director.loadScene('tetris');
    },

    //玩家触摸事件
    initEvent() {
        let sx, sy, dx, dy, ex, ey;
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            let startPoint = e.getLocation();
            sx = startPoint.x;
            sy = startPoint.y;

        }, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            let startPoint = e.getLocation();
            ex = startPoint.x;
            ey = startPoint.y;
            dx = ex - sx;
            dy = ey - sy;
        }, this)

        this.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            //根据横纵坐标位移判断滑动方向
            if (dy > 50 && Math.abs(dy / dx) > 2) this.rotate();
            if (dy < -50 && Math.abs(dy / dx) > 2) {
                this.dropSpeed = 0;
                this.moveDown();
            };
            if (dx < -50 && Math.abs(dx / dy) > 2) this.moveLeft();
            if (dx > 50 && Math.abs(dx / dy) > 2) this.moveRight();
        }, this);
    },

    drop() {
        if (!this.gameOver) {
            this.moveDown();
        }
    },

    backList() {
        cc.director.loadScene('startscene');
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
