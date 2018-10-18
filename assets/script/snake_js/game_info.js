cc.Class({
    extends: cc.Component,

    properties: {
        canvas: {
            default: null,
            type: cc.Node
        },
        btn1: {
            default: null,
            type: cc.Node
        },
        scoreLabel: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.scoreLabel.string = "Score:" + this.canvas.getComponent("snake_game").score.toString();
        this.btn1.on(cc.Node.EventType.TOUCH_START, (e) => {
            this.node.runAction(
                cc.sequence(
                    cc.fadeOut(0.2),
                    cc.callFunc(()=> {
                        // 加载列表
                        cc.director.loadScene('snake');
                    }, this)
                )
            );
        }, this)
    },

    backToList (){
        cc.director.loadScene('startscene');
    }
});
