const PipeManager = require('pipe_manager');
const Bird = require('bird');
const Scroller = require('scroller');
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
        this.revealScene();
    },
    revealScene() {
        this.maskLayer.active = true;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(cc.fadeOut(0.3));
    },
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
    gameStart() {
        // 隐藏准备提示
        this.hideReadyMenu();
        // 生成管道
        this.pipeManager.startSpawn();
        // bird fly
        this.bird.startFly();
    },
    gameOver() {
        // 管道重置
        this.pipeManager.reset();
        // 地面停止滚动
        this.ground.getComponent(Scroller).stopScroll();
        // 停止游戏输入监听
        this.enableInput(false);
        // 屏幕闪烁
        this.blinkOnce();
        // 显示游戏结束面板
        this.showGameOverMenu();
    },
    backBegainPage(e) {
        cc.director.loadScene('flappy_bird');
    },
    gainScore() {
        this.score++;
        this.scoreLabel.string = this.score;
    },
    // 隐藏准备面板
    hideReadyMenu() {
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
    //屏幕闪烁一下
    blinkOnce() {
        this.maskLayer.color = cc.Color.WHITE;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeTo(0.1, 200),
                cc.fadeOut(0.1)
            )
        );
    },
    // 显示游戏结束面板
    showGameOverMenu() {
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
        const gameOverNode = this.gameOverMenu.getChildByName("gameOverLabel");
        const resultBoardNode = this.gameOverMenu.getChildByName("resultBoard");
        const startButtonNode = this.gameOverMenu.getChildByName("startBtn");
        const backButtonNode = this.gameOverMenu.getChildByName("backbtn");
        const currentScoreNode = resultBoardNode.getChildByName("currentScore");
        const bestScoreNode = resultBoardNode.getChildByName("bestScore");
        const medalNode = resultBoardNode.getChildByName("medal");

        // 保存最高分到服务

        const globalNode = cc.director.getScene().getChildByName('gameUser').getComponent('game_user_js');
        const db = wx.cloud.database();
        let bestScore = globalNode.userGameInfo.fbBestScore || 0;

        if (this.score > bestScore) {
            bestScore = this.score;
            db.collection('userGameInfo').where({
                _openid: globalNode.openid
            }).get({
                success: res => {
                    db.collection('userGameInfo').doc(res.data[0]._id).update({
                        data: {
                            'fbBestScore': bestScore,
                            'updateTime': db.serverDate()
                        },
                        success: sc => {
                            globalNode.setUserGameInfo('fbBestScore', bestScore);
                            console.log('保存成功')
                        }
                    })
                }
            })
        };
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
    startGameOrJumpBird() {
        if (this.bird.state === Bird.State.Ready) {
            this.gameStart();
        } else {
            this.bird.rise();
        }
    },
    // 事件控制
    enableInput(enable) {
        if (enable) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.startGameOrJumpBird, this);
        } else {
            this.node.off(cc.Node.EventType.TOUCH_START, this.startGameOrJumpBird, this);
        }
    }
})
