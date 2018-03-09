// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

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
