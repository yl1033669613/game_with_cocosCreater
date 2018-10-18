const KEY_BEST_SCORE = "bestScore";

var PipeManager = require('pipe_manager');
var Bird = require('bird');
var Scroller = require('scroller');

cc.Class({
    extends: cc.Component,

    properties: {
        /** 得金牌的分数 */
        goldScore: 20,
        /** 得银牌的分数 */
        silverScore: 10,
        /** 管道管理组件 */
        pipeManager: PipeManager,
        /** 小鸟组件 */
        bird: Bird,
        /** 分数显示节点 */
        scoreLabel: cc.Label,
        /** 遮罩节点 */
        maskLayer: {
            default: null,
            type: cc.Node
        },
        /** 地面节点 */
        ground: {
            default: null,
            type: cc.Node
        },
        /** 准备开始菜单节点 */
        readyMenu: {
            default: null,
            type: cc.Node
        },
        /** 游戏结束的菜单节点 */
        gameOverMenu: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.score = 0;
        this.scoreLabel.string = this.score;
        this.bird.init(this);
        this._enableInput(true);
        this._revealScene();
    },

    _revealScene() {
        this.maskLayer.active = true;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(cc.fadeOut(0.3));
    },

    /** 点击游戏结束菜单中的重新开始游戏按钮会调用此方法 */
    restart() {
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeIn(0.3),
                cc.callFunc(() => {
                    // 重新加载场景
                    cc.director.loadScene('bird_game');
                }, this)
            )
        );
    },

    //游戏开始
    _gameStart() {
        // 隐藏准备提示
        this._hideReadyMenu();
        // 生成管道
        this.pipeManager.startSpawn();
        // bird fly
        this.bird.startFly();
    },

    // 游戏结束
    gameOver() {
        // 管道重置
        this.pipeManager.reset();
        // 地面停止滚动
        this.ground.getComponent(Scroller).stopScroll();
        // 停止游戏输入监听
        this._enableInput(false);
        // 屏幕闪烁
        this._blinkOnce();
        // 显示游戏结束面板
        this._showGameOverMenu();
    },

    // 返回开始页面
    backBegainPage(e) {
        cc.director.loadScene('flappy_bird');
    },

    // 分数更新
    gainScore() {
        this.score++;
        this.scoreLabel.string = this.score;
    },

    // 隐藏准备面板
    _hideReadyMenu() {
        this.scoreLabel.node.runAction(cc.fadeIn(0.3));
        this.readyMenu.runAction(
            cc.sequence(
                cc.fadeOut(0.5),
                cc.callFunc(() => {
                    this.readyMenu.active = false;
                }, this)
            )
        );
    },

    /** 屏幕闪烁一下 */
    _blinkOnce() {
        this.maskLayer.color = cc.Color.WHITE;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeTo(0.1, 200),
                cc.fadeOut(0.1)
            )
        );
    },

    // 显示游戏结束面板
    _showGameOverMenu() {
        // 隐藏分数
        this.scoreLabel.node.runAction(
            cc.sequence(
                cc.fadeOut(0.3),
                cc.callFunc(() => {
                    this.scoreLabel.node.active = false;
                }, this)
            )
        );

        // 获取游戏结束界面的各个节点
        let gameOverNode = this.gameOverMenu.getChildByName("gameOverLabel");
        let resultBoardNode = this.gameOverMenu.getChildByName("resultBoard");
        let startButtonNode = this.gameOverMenu.getChildByName("startBtn");
        let backButtonNode = this.gameOverMenu.getChildByName("backbtn");
        let currentScoreNode = resultBoardNode.getChildByName("currentScore");
        let bestScoreNode = resultBoardNode.getChildByName("bestScore");
        let medalNode = resultBoardNode.getChildByName("medal");

        // 保存最高分到本地
        let bestScore = cc.sys.localStorage.getItem(KEY_BEST_SCORE);
        if (bestScore === "null" || bestScore === "undefined" || this.score > bestScore) {
            bestScore = this.score;
        }
        cc.sys.localStorage.setItem(KEY_BEST_SCORE, bestScore);

        // 显示当前分数、最高分
        currentScoreNode.getComponent(cc.Label).string = this.score;
        bestScoreNode.getComponent(cc.Label).string = bestScore;

        // 决定是否显示奖牌
        let showMedal = (err, spriteFrame) => {
            if (this.score >= this.goldScore) {
                medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame._spriteFrames.medal_gold;
            } else if (this.score >= this.silverScore) {
                medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame._spriteFrames.medal_silver;
            } else {
                medalNode.getComponent(cc.Sprite).spriteFrame = null;
            }
        };
        cc.loader.loadRes("texture/res_bundle", cc.SpriteAtlas, showMedal);

        // 依次显示各个节点
        let showNode = (node, action, callback) => {
            startButtonNode.active = true;
            backButtonNode.active = true;
            node.runAction(cc.sequence(
                action,
                cc.callFunc(() => {
                    if (callback) {
                        callback();
                    }
                }, this)
            ));
        };

        this.gameOverMenu.active = true;

        let showNodeFunc = () => showNode(
            gameOverNode,
            cc.spawn(
                cc.fadeIn(0.2),
                cc.sequence(
                    cc.moveBy(0.2, cc.p(0, 10)),
                    cc.moveBy(0.5, cc.p(0, -10))
                )
            ),
            () => showNode(
                resultBoardNode,
                cc.moveTo(0.5, cc.p(resultBoardNode.x, -150)).easing(cc.easeCubicActionOut()),
                () => showNode(
                    startButtonNode,
                    cc.fadeIn(0.5))
            )
        );
        this.scheduleOnce(showNodeFunc, 0.55);
    },

    // 开始或者bird jump
    _startGameOrJumpBird() {
        if (this.bird.state === Bird.State.Ready) {
            this._gameStart();
        } else {
            this.bird.rise();
        }
    },

    // 事件控制
    _enableInput(enable) {
        if (enable) {
            this.node.on(cc.Node.EventType.TOUCH_START, this._startGameOrJumpBird, this);
        } else {
            this.node.off(cc.Node.EventType.TOUCH_START, this._startGameOrJumpBird, this);
        }
    },
});
