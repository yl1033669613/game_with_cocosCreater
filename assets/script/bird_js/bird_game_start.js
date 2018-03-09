cc.Class({
    extends: cc.Component,

    properties: {
        maskLayer: {
            default: null,
            type: cc.Node
        }
    },

    startGame() {
        this.maskLayer.active = true;
        this.maskLayer.opacity = 0;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeIn(0.2),
                cc.callFunc(() => {
                    // 重新加载场景
                    cc.director.loadScene('bird_game');
                }, this)
            )
        );
    },

    // 返回游戏列表
    backGameList() {
        this.maskLayer.active = true;
        this.maskLayer.opacity = 0;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeIn(0.2),
                cc.callFunc(() => {
                    // 加载列表
                    cc.director.loadScene('startscene');
                }, this)
            )
        );
    }
});
