cc.Class({
    extends: cc.Component,

    properties: {
        levelModeMask: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    freeMode() {
        cc.director.loadScene('game_needles');
    },

    levelModeMaskOpen() {
        this.levelModeMask.active = true;
        this.levelModeMask.opacity = 0;
        this.levelModeMask.runAction(cc.sequence(
            cc.scaleTo(0, 0.9, 0.9),
            cc.spawn(cc.scaleTo(0.2, 1, 1), cc.fadeIn(0.3))
        ));
    },

    levelModeMaskClose() {
        this.levelModeMask.runAction(cc.sequence(
            cc.spawn(cc.fadeOut(0.2), cc.scaleTo(0.2, 0.9, 0.9)),
            cc.callFunc(() => {
                this.levelModeMask.active = false;
            }, this)
        ))
    },

    levelModePlay() {
        cc.director.loadScene('game_needles');
    },

    backList() {
        cc.director.loadScene('startscene');
    },

    start() {

    }
});
