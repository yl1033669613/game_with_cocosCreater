const State = cc.Enum({
    /** 游戏开始前的准备状态 */
    Ready: -1,
    /** 小鸟上升中 */
    Rise: -1,
    /** 小鸟自由落体中 */
    FreeFall: -1,
    /** 小鸟碰撞到管道坠落中 */
    Drop: -1,
    /** 小鸟已坠落到地面静止 */
    Dead: -1,
});

cc.Class({
    statics: {
        State: State
    },

    extends: cc.Component,

    properties: {
        /** 上抛初速度，单位：像素/秒 */
        initRiseSpeed: 800,
        /** 重力加速度，单位：像素/秒的平方 */
        gravity: 1000,
        /** 小鸟的状态 */
        state: {
            default: State.Ready,
            type: State,
        },
        /** 地面节点 */
        ground: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.collideWithPipe = false;
        this.collideWithGround = false;
    },

    //初始化bird
    init(game) {
        this.game = game;
        this.state = State.Ready;
        this.currentSpeed = 0;
        this.anim = this.getComponent(cc.Animation);
        this.anim.playAdditive("birdFlapping");
        this.anim.playAdditive("birdWing");
    },

    // game begain
    startFly() {
        // 生成管道
        this._getNextPipe();
        // 停止小鸟上下浮动
        this.anim.stop("birdFlapping");
        // bird rise move
        this.rise();
    },

    //生成管道
    _getNextPipe() {
        this.nextPipe = this.game.pipeManager.getNext();
    },

    update(dt) {
        if (this.state === State.Ready || this.state === State.Dead) {
            return;
        }
        // 每帧更新bird位置
        this._updatePosition(dt);
        // 每帧更新状态
        this._updateState(dt);
        // 碰撞检测 处理
        this._detectCollision();
        // 修正最后落地位置
        this._fixBirdFinalPosition();
    },

    _updatePosition(dt) {
        var flying = this.state === State.Rise || this.state === State.FreeFall || this.state === State.Drop;
        if (flying) {
            this.currentSpeed -= dt * this.gravity;
            this.node.y += dt * this.currentSpeed;
        }
    },

    _updateState(dt) {
        switch (this.state) {
            case State.Rise:
                if (this.currentSpeed < 0) {
                    this.state = State.FreeFall;
                    this._runFallAction();
                }
                break;
            case State.Drop:
                if (this.collideWithGround) {
                    this.state = State.Dead;
                }
                break;
        }
    },

    _detectCollision() {
        if (!this.nextPipe) {
            return;
        }
        if (this.state === State.Ready || this.state === State.Dead || this.state === State.Drop) {
            return;
        }
        // 处理碰撞结果
        if (this.collideWithPipe || this.collideWithGround) {

            if (this.collideWithGround) { // 与地面碰撞
                this.state = State.Dead;
            } else { // 与水管碰撞
                this.state = State.Drop;
                this._runDropAction();
                this.scheduleOnce(() => {}, 0.3);
            }

            this.anim.stop();
            this.game.gameOver();
        } else { // 处理没有发生碰撞的情况
            let birdLeft = this.node.x;
            let pipeRight = this.nextPipe.node.x + this.nextPipe.topPipe.width
            let crossPipe = birdLeft > pipeRight;
            if (crossPipe) {
                this.game.gainScore();
                this._getNextPipe();
            }
        }
    },

    /** 修正最后落地位置 */
    _fixBirdFinalPosition() {
        if (this.collideWithGround) {
            this.node.y = this.ground.y + this.ground.height/2 + this.node.width / 2;
        }
    },

    // 碰撞回调
    onCollisionEnter(other, self) {
        // 检测bird与管道碰撞
        if (other.node._name === "topPipe" || other.node._name === "bottomPipe") {
            this.collideWithPipe = true;
        }
        // 检测与地面碰撞情况
        if (other.node._name === "ground") {
            this.collideWithGround = true;
        }
    },

    rise() {
        this.state = State.Rise;
        this.currentSpeed = this.initRiseSpeed;
        this._runRiseAction();
    },

    // 上升动作
    _runRiseAction() {
        this.node.stopAllActions();
        let jumpAction = cc.rotateTo(0.3, -30).easing(cc.easeCubicActionOut());
        this.node.runAction(jumpAction);
    },

    // 下落动作
    _runFallAction(duration = 0.6) {
        this.node.stopAllActions();
        let dropAction = cc.rotateTo(duration, 90).easing(cc.easeCubicActionIn());
        this.node.runAction(dropAction);
    },

    // 碰撞管道 speed = 0
    _runDropAction() {
        if (this.currentSpeed > 0) {
            this.currentSpeed = 0;
        }
        this._runFallAction(0.4);
    }
});
