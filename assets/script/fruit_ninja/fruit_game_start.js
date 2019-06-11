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
        let rotate = cc.repeatForever(cc.sequence(cc.rotateBy(0, 0), cc.rotateBy(7, 360)));
        let rotate1 = cc.repeatForever(cc.sequence(cc.rotateBy(0, 0), cc.rotateBy(7, -360)));
        let frRotate = cc.repeatForever(cc.sequence(cc.rotateBy(0, 0), cc.rotateBy(7, -360)));
        let frRotate1 = cc.repeatForever(cc.sequence(cc.rotateBy(0, 0), cc.rotateBy(7, 360)));
        this.btnBeginCir.runAction(rotate);
        this.btnQuitCir.runAction(rotate1);
        this.btnBeginfR.runAction(frRotate);
        this.btnQuitfR.runAction(frRotate1);
    },
    stopBtnAction() {
        this.btnBeginCir.stopAllActions();
        this.btnQuitCir.stopAllActions();
        this.btnBeginfR.stopAllActions();
        this.btnQuitfR.stopAllActions();
    },
    backList() {
        this.stopBtnAction();
        cc.director.loadScene('startscene');
    },
    gameStart() {
        this.stopBtnAction();
        cc.director.loadScene('fruit_ninja_game');
    }
});
