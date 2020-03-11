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
        this.maskLayer.opacity = 1;
        this.maskLayer.color = cc.Color.BLACK;
        cc.tween(this.maskLayer).to(.2, { opacity: 255 }).call(() => {
            // 重新加载场景
            cc.director.loadScene('bird_game');
        }).start()
    },
    // 返回游戏列表
    backGameList() {
        this.maskLayer.active = true;
        this.maskLayer.opacity = 1;
        this.maskLayer.color = cc.Color.BLACK;
        cc.tween(this.maskLayer).to(.2, { opacity: 255 }).call(() => {
            // 加载列表
            cc.director.loadScene('startscene');
        }).start()
    }
})
