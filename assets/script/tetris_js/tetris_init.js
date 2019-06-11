const tets = require('./tetris_type.js');
const Utils = require('../utils.js');
const DROPSPEED = 500;
const ROW = 20;
const COL = 10;
const WIDTH = 18;
const DFCOLOR = "61/60/60/255"; //默认rect color
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
        previewBlock: {
            type: cc.Node,
            default: null
        }
    },
    onLoad() {
        this.ctx = this.theBoard.getComponent(cc.Graphics);
        this.previewCtx = this.previewBlock.getComponent(cc.Graphics);
        this.board = [];
        this.previewShapeBoard = [];

        this.SHAPES = [
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

        //随机块 位置及旋转形状
        this.x = 3;
        this.y = -2;
        this.randomShape = '';
        this.color = ''; //当前形状对应颜色
        this.rotateIdx = 0; //当前形状对应旋转位置index
        this.rotateShape = ''; //当前形状对应旋转位置
        this.bestScore = Utils.GD.userGameInfo.tetrisBestScore || 0;
    },
    //随机获取一个形状
    randomOne() {
        let r = Math.floor(Math.random() * this.SHAPES.length);
        this.x = 3;
        this.y = -2;
        this.randomShape = this.SHAPES[r][0];
        this.rotateIdx = Math.floor(Math.random() * this.randomShape.length);
        this.color = this.SHAPES[r][1];
        this.rotateShape = this.randomShape[this.rotateIdx];
        this.drawPreviewShape();
    },
    //draw board
    drawBoard() {
        this.ctx.clear();
        for (let r = 0; r < ROW; r++)
            for (let c = 0; c < COL; c++) this.drawRect(c, r, this.board[r][c]);
    },
    //绘制预览board
    drawPreviewShape() {
        this.previewCtx.clear();
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                this.previewShapeBoard[r][c] = '255/255/255/10';
                if (this.rotateShape[r] && this.rotateShape[r][c]) this.previewShapeBoard[r][c] = this.color;
                this.drawPreviewRect(c, r, this.previewShapeBoard[r][c]);
            }
        }
    },
    //绘制单个预览矩形
    drawPreviewRect(x, y, color) {
        let c = color.split('/').map(a => parseFloat(a));
        let col = new cc.Color({ r: c[0], g: c[1], b: c[2], a: c[3] });
        this.previewCtx.fillColor = col;
        this.previewCtx.rect((x * WIDTH) + (2 * x), (WIDTH * 4 - 10) - ((y * WIDTH) + (2 * y)), WIDTH, WIDTH);
        this.previewCtx.stroke();
        this.previewCtx.fill();
    },
    //绘制单个矩形 填充颜色
    drawRect(x, y, color) {
        let c = color.split('/').map(a => parseFloat(a));
        let col = new cc.Color({ r: c[0], g: c[1], b: c[2], a: c[3] });
        this.ctx.fillColor = col;
        this.ctx.rect((x * WIDTH) + (2 * x), (WIDTH * ROW + 22) - ((y * WIDTH) + (2 * y)), WIDTH, WIDTH);
        this.ctx.stroke();
        this.ctx.fill();
    },
    // 绘制形状
    fills(color) {
        for (let r = 0; r < this.rotateShape.length; r++) {
            for (let c = 0; c < this.rotateShape.length; c++)
            // 只渲染被占用的位置
                if (this.rotateShape[r][c]) this.drawRect(this.x + c, this.y + r, color);
        }
    },
    // 绘制带颜色的形状
    draw() {
        this.fills(this.color);
    },
    // 绘制空 （覆盖之前有颜色的矩形）
    drawEmpty() {
        this.fills(DFCOLOR);
    },
    moveDown() {
        if (!this.collisionDetection(0, 1, this.rotateShape)) {
            this.drawEmpty();
            this.y++; //下移一格
            this.draw();
        } else {
            this.drawOnBoard();
            this.randomOne();
        }
    },
    // right
    moveRight() {
        if (!this.collisionDetection(1, 0, this.rotateShape)) {
            this.drawEmpty();
            this.x++; //右移一格
            this.draw();
        }
    },
    // left 
    moveLeft() {
        if (!this.collisionDetection(-1, 0, this.rotateShape)) {
            this.drawEmpty();
            this.x--; //左移一格
            this.draw();
        }
    },
    // rotate
    rotate() {
        let nextBck = this.randomShape[(this.rotateIdx + 1) % this.randomShape.length];
        let drt = 0;
        if (this.collisionDetection(0, 0, nextBck)) {
            if (this.x > COL / 2) {
                // 到达右边界
                drt = -1;
            } else {
                // 到达右左边界
                drt = 1;
            }
        };
        if (!this.collisionDetection(drt, 0, nextBck)) {
            this.drawEmpty();
            this.x += drt;
            this.rotateIdx = (this.rotateIdx + 1) % this.randomShape.length;
            this.rotateShape = this.randomShape[this.rotateIdx];
            this.draw();
        }
    },
    //形状无法向下继续移动时将形状保存到board数组, 并且重新绘制board
    drawOnBoard() {
        this.dropSpeed = DROPSPEED;
        for (let r = 0; r < this.rotateShape.length; r++) {
            for (let c = 0; c < this.rotateShape.length; c++) {
                // 跳过空格
                if (!this.rotateShape[r][c]) continue;
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
                // 将颜色方块压入board数组中
                this.board[this.y + r][this.x + c] = this.color;
            }
        }
        // 移除填满的行
        for (let r = 0; r < ROW; r++) {
            let isRowFull = true;
            for (let c = 0; c < COL; c++) isRowFull = isRowFull && (this.board[r][c] != DFCOLOR);
            if (isRowFull) {
                // 当一行被填满时将 上面的方块向下移动
                for (let y = r; y > 1; y--)
                    for (let c = 0; c < COL; c++) this.board[y][c] = this.board[y - 1][c];
                // 第一行
                for (let c = 0; c < COL; c++) this.board[0][c] = DFCOLOR;
                // 更新分数
                this.score += 10;
            }
        };
        // 更新borad
        this.drawBoard();

        // 渲染分数
        this.scoreLabel.string = 'score:' + this.score;
    },
    //碰撞检测
    collisionDetection(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape.length; c++) {
                // 非形状所在区域 跳过
                if (!shape[r][c]) continue;
                let nxtX = this.x + c + x,
                    nxtY = this.y + r + y;
                if (nxtX < 0 || nxtX >= COL || nxtY >= ROW) return true;
                // 跳过 nxtY < 0 初始位置为负数的情况
                if (nxtY < 0) continue;
                // 判断是是否为非空格
                if (this.board[nxtY][nxtX] != DFCOLOR) return true;
            }
        };
        return false
    },
    //玩家触控
    initEvent() {
        let sx, sy, dx, dy;
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            let startPoint = e.getLocation();
            sx = startPoint.x;
            sy = startPoint.y;
            dx = 0;
            dy = 0;
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            let startPoint = e.getLocation();
            let ex = startPoint.x;
            let ey = startPoint.y;
            let curx = ex - sx,
                cury = ey - sy;
            if (Math.abs(curx) > 12 || Math.abs(cury / curx) > 2) dx = curx;
            if (Math.abs(cury) > 12 || Math.abs(curx / cury) > 2) dy = cury;
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            //根据横纵坐标位移判断滑动方向 up to rotate, left to left, right to right, down to down
            if (this.gameOver) return;
            if (dy > 25 && Math.abs(dy / dx) > 2) this.rotate();
            if (dy < -25 && Math.abs(dy / dx) > 2) {
                this.dropSpeed = 0;
                this.moveDown();
            };
            if (dx < -25 && Math.abs(dx / dy) > 2) this.moveLeft();
            if (dx > 25 && Math.abs(dx / dy) > 2) this.moveRight();
        }, this)
    },
    //保存最高得分 wx cloud
    requestDbTetrisBestScore(cb) {
        const self = this;
        Utils.GD.updateGameScore({tetrisBestScore: self.score}, () => {
            Utils.GD.setUserGameInfo('tetrisBestScore', self.score);
            cb && cb();
            console.log('保存成功');
        })
    },
    showGameOverInfo() {
        this.overScoreLabel.string = 'score: ' + this.score;
        this.bestScoreLabel.string = 'best score: ' + this.bestScore;

        this.gameOverInfo.active = true;
        this.gameOverInfo.opacity = 1;
        this.gameOverInfo.runAction(cc.sequence(
            cc.scaleTo(0, 0.9, 0.9),
            cc.spawn(cc.scaleTo(0.3, 1, 1), cc.fadeIn(0.3))
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
            for (let c = 0; c < COL; c++) this.board[r][c] = DFCOLOR;
        };
        this.drawBoard();
        this.randomOne();
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
            for (let c = 0; c < COL; c++) this.board[r][c] = DFCOLOR
        };
        //create preview board
        for (let r = 0; r < 4; r++) {
            this.previewShapeBoard[r] = [];
            for (let c = 0; c < 4; c++) this.previewShapeBoard[r][c] = '255/255/255/10'
        };

        this.scoreLabel.string = 'score:' + this.score;
        this.drawBoard();
        this.randomOne();
        this.initEvent();
    },
    update(dt) {
        this.fps += dt * 1000;
        if (this.fps > this.dropSpeed) {
            this.fps = 0;
            if (!this.gameOver) this.moveDown();
        }
    }
})
