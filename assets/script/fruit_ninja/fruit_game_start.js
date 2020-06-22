cc.Class({
    extends: cc.Component,
    properties: {
        knife: {
            default: null,
            type: cc.Node
        },
        btnBeginCir: {
            default: null,
            type: cc.Node
        },
        btnQuitCir: {
            default: null,
            type: cc.Node
        },
        btnBeginfR: {
            default: null,
            type: cc.Node
        },
        btnQuitfR: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        cc.director.preloadScene('fruit_ninja_game');

        this.knifeMotionS = this.knife.getComponent(cc.MotionStreak);
    },
    start() {
        this.knifeMove();
        this.circleRotate();
    },
    knifeMove() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.startEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.moveEvent, this);
    },
    startEvent(e) {
        let pos = this.node.convertToNodeSpaceAR(new cc.Vec2(e.getLocation()));
        this.knife.setPosition(pos);
        this.knifeMotionS.reset();
    },
    moveEvent(e) {
        let pos = this.node.convertToNodeSpaceAR(new cc.Vec2(e.getLocation()));
        this.knife.setPosition(pos);
    },
    circleRotate() {
        let createRote = (angle) => {
            return cc.tween().by(7, { angle: angle }).repeatForever();
        }
        cc.tween(this.btnBeginCir).then(createRote(360)).start();
        cc.tween(this.btnQuitCir).then(createRote(360)).start();
        cc.tween(this.btnBeginfR).then(createRote(-360)).start();
        cc.tween(this.btnQuitfR).then(createRote(-360)).start();
    },
    backList() {
        cc.director.loadScene('startscene');
    },
    gameStart() {
        cc.director.loadScene('fruit_ninja_game');
    }
});
