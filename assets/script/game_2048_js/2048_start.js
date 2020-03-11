const Utils = require('../utils.js');

cc.Class({
    extends: cc.Component,
    properties: {
        rectPfb: {
            default: null,
            type: cc.Prefab
        },
        currentScore: {
            default: null,
            type: cc.Node
        },
        infoPanel: {
            default: null,
            type: cc.Node
        },
        infoScore: {
            default: null,
            type: cc.Node
        },
        infoBestScore: {
            default: null,
            type: cc.Node
        },
        gameWinMask: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        let windowSize = cc.find("Canvas");
        this.node.height = this.node.width = windowSize.width - 14;
        let rectBgNode = this.node.getChildByName('gameShadowRect');
        this.ctx = rectBgNode.getComponent(cc.Graphics);
        //格子数组
        this.map = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        this.box_width = this.node.width * 0.86 * 0.25; //单个方块宽度
        this.margin_width = this.node.width * 0.14 * 0.2; //方块之间的间隔
        //不同数字的背景颜色信息
        this.num_color = {
            '0': "#ccc0b3",
            '2': "#ffeecd",
            '4': "#ffcb6a",
            '8': "#ffa65a",
            '16': "#ff8545",
            '32': "#ff643f",
            '64': "#e4451e",
            '128': "#bd3b18",
            '256': "#ece688",
            '512': "#f8ec24",
            '1024': "#42f391",
            '2048': "#00ffae"
        };
        //space表示当前剩余的空格块数，score表示当前的分数
        this.space = 16;
        this.score = 0;
        this.isGameOver = false;
        this.bestScore = Utils.GD.userGameInfo.tzfeBestScore || 0;
        this.WinTimes = Utils.GD.userGameInfo.tzfeWinNum || 0;
    },
    //循环
    loop(func) {
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) func(i, j);
    },
    //绘制方块背景
    drawBgShadowRect() {
        const self = this;
        let color = new cc.Color(255, 255, 255, 30);
        self.loop(function (i, j) {
            let x = j == 0 ? self.margin_width : j * (self.box_width + self.margin_width) + self.margin_width,
                y = i == 3 ? self.margin_width : (3 - i) * (self.box_width + self.margin_width) + self.margin_width;
            self.ctx.lineWidth = 0;
            self.ctx.rect(x, y, self.box_width, self.box_width);
            self.ctx.fillColor = color;
            self.ctx.fill();
        })
    },
    // 随机生成方块
    produce() {
        // 随机取当前剩余方块以内的数
        const self = this;
        let cot = ~~(Math.random() * self.space);
        let k = 0;
        self.loop(function (i, j) {
            if (self.map[i][j] == 0) {
                if (cot == k) {
                    self.map[i][j] = 2;
                    self.block();
                }
                k += 1;
            }
        });
        self.space -= 1;
    },
    clearNumRects() { //销毁方块
        for (let i = 0; i < this.node.children.length; i++) {
            if (this.node.children[i]._name == '2048RectPfb') this.node.children[i].destroy();
        }
    },
    // 根据map 数组渲染方块
    block() {
        const self = this;
        self.clearNumRects();
        self.loop((i, j) => {
            let num = self.map[i][j],
                color = self.num_color[String(num)];
            if (num != 0) {
                self.drawRects(j == 0 ? self.margin_width : j * (self.box_width + self.margin_width) + self.margin_width, i == 3 ? self.margin_width : (3 - i) * (self.box_width + self.margin_width) + self.margin_width, self.box_width, color, num);
            }
        })
    },
    // 绘制单个矩形
    drawRects(x, y, w, c, n) {
        let colorObj = new cc.Color();
        let rect = cc.instantiate(this.rectPfb);
        rect.width = rect.height = w;
        rect.setPosition(cc.v2(x, y));
        let label = rect.getChildByName('2048Number'),
            bg = rect.getChildByName('2048RectBg');
        bg.color = colorObj.fromHEX(String(c));
        label.color = (n <= 4) ? colorObj.fromHEX("#ffb638") : cc.Color.WHITE;
        label.getComponent(cc.Label).string = n;
        this.node.addChild(rect);
    },
    // game start 默认生成两个方块
    init() {
        for (let i = 0; i < 2; i++) this.produce();
    },
    move(direction) {
        let isValid = false; //判断是否是有效移动
        if (this.isGameOver) return;

        function convert(x, y) { //根据不同方向调整遍历方式
            let tx = x,
                ty = y,
                tmpTx = tx;
            if (direction[0] == 0) {
                tx = ty;
                ty = tmpTx;
            };
            if (direction[1] > 0) tx = 3 - tx;
            if (direction[0] > 0) ty = 3 - ty;
            return [tx, ty];
        };

        for (let i = 0; i < 4; i++) {
            let tmp = [];
            let isadd = false; //每一行或者每一列只能有一次数字合并
            for (let j = 0; j < 4; j++) {
                let ti = convert(i, j)[0],
                    tj = convert(i, j)[1];
                if (this.map[ti][tj] != 0) {
                    if (!isadd && this.map[ti][tj] == tmp[tmp.length - 1]) {
                        this.score += (tmp[tmp.length - 1] *= 2); //数字合并获得分数加成
                        if (tmp[tmp.length - 1] == 2048) { //如果获得2048则游戏结束
                            this.isGameOver = true;
                            this.showTheGamePanel(true, this.gameWinMask);
                            this.setWinTimes();
                        };
                        isadd = true;
                        this.space += 1;
                        if (!isValid) isValid = true; //发生数字合并认定这次移动为有效移动
                        this.currentScore.getComponent(cc.Label).string = 'score:' + this.score;
                    } else {
                        tmp.push(this.map[ti][tj]);
                    }
                }
            };
            for (let j = 0; j < 4; j++) {
                let ti = convert(i, j)[0],
                    tj = convert(i, j)[1];
                if (this.map[ti][tj] == 0 && tmp[j] > 0)
                    if (!isValid) isValid = true; //数字发生移动，（原来为0的数字变为大于0被认为是有效移动）
                this.map[ti][tj] = isNaN(tmp[j]) ? 0 : tmp[j];
            }
        };
        if (isValid && this.space > 0) { //如果是有效移动则在随机空位新生成一个数字2
            this.produce();
            isValid = false;
        };
        if (this.space == 0 && this.gameOver() && !this.isGameOver) { //判断游戏失败 剩余空格为0 并且没有数字可以合并时游戏结束
            this.isGameOver = true;
            this.infoScore.getComponent(cc.Label).string = 'score:' + this.score;

            this.setDbDataWhenScoreChange(); //保存最高分
            this.infoBestScore.getComponent(cc.Label).string = 'best:' + this.bestScore;
            this.showTheGamePanel(true, this.infoPanel);
            return;
        }
    },
    gameOver() { //判断是否还有可能的合并
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let t = ((i == 0) ? null : [i - 1, j]),
                    r = ((j == 3) ? null : [i, j + 1]),
                    b = ((i == 3) ? null : [i + 1, j]),
                    l = ((j == 0) ? null : [i, j - 1]);
                if (t && this.map[i][j] == this.map[t[0]][t[1]]) return false;
                if (r && this.map[i][j] == this.map[r[0]][r[1]]) return false;
                if (b && this.map[i][j] == this.map[b[0]][b[1]]) return false;
                if (l && this.map[i][j] == this.map[l[0]][l[1]]) return false;
            }
        };
        return true;
    },
    setDbDataWhenScoreChange() {
        const self = this;
        if (self.score > self.bestScore) {
            self.bestScore = self.score;
            Utils.GD.updateGameScore({ tzfeBestScore: self.bestScore }, () => {
                Utils.GD.setUserGameInfo('tzfeBestScore', self.bestScore);
                console.log('保存成功');
            })
        }
    },
    setWinTimes() {
        const self = this;
        self.WinTimes = self.WinTimes + 1;
        Utils.GD.updateGameScore({ tzfeWinNum: self.WinTimes }, () => {
            Utils.GD.setUserGameInfo('tzfeWinNum', self.WinTimes);
            console.log('保存成功');
        })
    },
    showTheGamePanel(bool, cpt) {
        if (bool) {
            cpt.active = bool;
            cpt.opacity = 1;
            cc.tween(cpt).to(.2, { opacity: 255 }).start()
        } else {
            cc.tween(cpt).to(.2, { opacity: 0 }).call(() => {
                cpt.active = bool;
            }).start()
        }
    },
    //玩家触摸事件
    eventHandle() {
        let canvasScr = this.node.parent,
            sx, sy, dx, dy;
        canvasScr.on(cc.Node.EventType.TOUCH_START, (e) => {
            let startPoint = e.getLocation();
            sx = startPoint.x;
            sy = startPoint.y;
            dx = 0;
            dy = 0;
        }, this);

        canvasScr.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            let startPoint = e.getLocation();
            let ex = startPoint.x;
            let ey = startPoint.y;
            dx = ex - sx;
            dy = ey - sy;
        }, this);

        canvasScr.on(cc.Node.EventType.TOUCH_END, (e) => {
            //根据横纵坐标位移判断滑动方向
            if (dy < -30 && Math.abs(dy / dx) > 2) this.move([0, 1]);
            if (dy > 30 && Math.abs(dy / dx) > 2) this.move([0, -1]);
            if (dx < -30 && Math.abs(dx / dy) > 2) this.move([-1, 0]);
            if (dx > 30 && Math.abs(dx / dy) > 2) this.move([1, 0]);
        }, this);
    },
    back_game_list() {
        cc.director.loadScene('startscene');
    },
    restartGame() {
        this.clearNumRects();
        this.space = 16;
        this.score = 0;
        this.isGameOver = false;
        this.map = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        this.showTheGamePanel(false, this.infoPanel);
        this.showTheGamePanel(false, this.gameWinMask);
        this.currentScore.getComponent(cc.Label).string = 'score:' + this.score;
        this.init();
    },
    start() { //初始化
        this.drawBgShadowRect();
        this.eventHandle();
        this.init();
    }
})