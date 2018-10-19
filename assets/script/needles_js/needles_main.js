cc.Class({
    extends: cc.Component,

    properties: {
        bigCircle: {
            default: null,
            type: cc.Node
        },
        needlePfb: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    createNeedles() {
        let needleBody = cc.instantiate(this.needlePfb);
        let rotation = 360 - (this.bigCircle.rotation % 360);
        needleBody.rotation = rotation;
        this.bigCircle.addChild(needleBody);
    },

    circleRotate() {
        let rotate = cc.repeatForever(cc.sequence(cc.rotateBy(0, 0), cc.rotateBy(8, 360)));
        this.bigCircle.runAction(rotate);
    },

    backStart() {
        cc.director.loadScene('game_needles_start');
    },

    userHandle() {
        this.node.on(cc.Node.EventType.TOUCH_START, function(e) {
            this.createNeedles();
        }, this)
    },

    start() {
        this.circleRotate();
        this.userHandle();
    },

    update(dt) {

    }
});
