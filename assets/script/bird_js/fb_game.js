const PipeManager = require('pipe_manager');
const Bird = require('bird');
const Utils = require('../utils.js');
cc.Class({
    extends: cc.Component,
    properties: {
        goldScore: 20,
        silverScore: 10,
        pipeManager: PipeManager,
        bird: Bird,
        scoreLabel: cc.Label,
        maskLayer: {
            default: null,
            type: cc.Node
        },
        ground: {
            default: null,
            type: cc.Node
        },
        readyMenu: {
            default: null,
            type: cc.Node
        },
        gameOverMenu: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        this.score = 0;
        this.scoreLabel.string = this.score;
        this.bird.init(this);
        this.enableInput(true);
        this.revealScene()
    },
    revealScene() {
        this.maskLayer.active = true;
        this.maskLayer.color = cc.Color.BLACK;
        cc.tween(this.maskLayer).to(.3, { opacity: 0 }).start()
    },
    restart() {
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.opacity = 1;
        cc.tween(this.maskLayer).to(.3, { opacity: 255 }).call(() => {
            // 重新加载场景
            cc.director.loadScene('bird_game');
        }).start()
    },
    gameStart() {
        // 隐藏准备提示
        this.hideReadyMenu();
        // 生成管道
        this.pipeManager.startSpawn();
        // bird fly
        this.bird.startFly()
    },
    gameOver() {
        // 管道重置
        this.pipeManager.reset();
        // 地面停止滚动
        this.ground.getComponent('scroller').stopScroll();
        // 停止游戏输入监听
        this.enableInput(false);
        // 屏幕闪烁
        this.blinkOnce();
        // 显示游戏结束面板
        this.showGameOverMenu()
    },
    backBegainPage() {
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.opacity = 1;
        cc.tween(this.maskLayer).to(.3, { opacity: 255 }).call(() => {
            // 重新加载场景
            cc.director.loadScene('flappy_bird')
        }).start()
    },
    gainScore() {
        this.score++;
        this.scoreLabel.string = this.score
    },
    // 隐藏准备面板
    hideReadyMenu() {
        this.scoreLabel.node.opacity = 1;
        cc.tween(this.scoreLabel.node).to(0, { opacity: 255 }).start();
        cc.tween(this.readyMenu).to(.5, { opacity: 0 }).call(() => {
            this.readyMenu.active = false
        }).start()
    },
    //屏幕闪烁一下
    blinkOnce() {
        this.maskLayer.color = cc.Color.WHITE;
        cc.tween(this.maskLayer).to(.1, { opacity: 200 }).to(.1, { opacity: 0 }).start()
    },
    // 显示游戏结束面板
    showGameOverMenu() {
        // 隐藏分数
        cc.tween(this.scoreLabel.node).to(.3, { opacity: 0 }).call(() => {
            this.scoreLabel.node.active = false;
        }).start();
        // 获取游戏结束界面的各个节点
        const gameOverNode = this.gameOverMenu.getChildByName("gameOverLabel");
        const resultBoardNode = this.gameOverMenu.getChildByName("resultBoard");
        const startButtonNode = this.gameOverMenu.getChildByName("startBtn");
        const backButtonNode = this.gameOverMenu.getChildByName("backbtn");
        const currentScoreNode = resultBoardNode.getChildByName("currentScore");
        const bestScoreNode = resultBoardNode.getChildByName("bestScore");
        const medalNode = resultBoardNode.getChildByName("medal");
        // 保存最高分
        let bestScore = Utils.GD.userGameInfo.fbBestScore || 0;
        if (this.score > bestScore) {
            bestScore = this.score;
            Utils.GD.updateGameScore({
                fbBestScore: bestScore
            }, () => {
                Utils.GD.setUserGameInfo('fbBestScore', bestScore);
                console.log('保存成功')
            })
        };
        // 显示当前分数、最高分
        currentScoreNode.getComponent(cc.Label).string = this.score;
        bestScoreNode.getComponent(cc.Label).string = bestScore;
        // 判断是否显示奖牌
        let showMedal = (err, spriteFrame) => {
            if (this.score >= this.goldScore) {
                medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame._spriteFrames.medal_gold;
            } else if (this.score >= this.silverScore) {
                medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame._spriteFrames.medal_silver;
            } else {
                medalNode.getComponent(cc.Sprite).spriteFrame = null;
            }
        };
        cc.loader.loadRes("res_bundle", cc.SpriteAtlas, showMedal); // 动态加载资源
        // 依次显示各个节点
        startButtonNode.active = true;
        backButtonNode.active = true;
        this.gameOverMenu.active = true;
        startButtonNode.opacity = 1;
        gameOverNode.opacity = 1;
        cc.tween(gameOverNode).parallel(
            cc.tween().to(.2, { opacity: 255 }),
            cc.tween().by(.2, { position: cc.v2(0, 10) }).by(.3, { position: cc.v2(0, -10) })
        ).start();
        cc.tween(startButtonNode).delay(.3).to(.5, { opacity: 255 }).start();
        cc.tween(resultBoardNode).delay(.3).to(.9, { position: cc.v2(resultBoardNode.x, 200) }, { easing: 'cubicInOut' }).start();
    },
    // 开始或者bird jump
    startGameOrJumpBird() {
        if (this.bird.state === Bird.State.Ready) {
            this.gameStart()
        } else {
            this.bird.rise()
        }
    },
    // 事件控制
    enableInput(enable) {
        if (enable) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.startGameOrJumpBird, this)
        } else {
            this.node.off(cc.Node.EventType.TOUCH_START, this.startGameOrJumpBird, this)
        }
    }
})