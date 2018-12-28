cc.Class({
    extends: cc.Component,
    properties: {
        loadingBg: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        cc.director.preloadScene('aircraft_war_game');
        this.loadingBgAction()
    },
    startGame() {
        cc.director.loadScene('aircraft_war_game')
    },
    backList() {
        cc.director.loadScene('startscene')
    },
    loadingBgAction() {
        let act = cc.repeatForever(cc.sequence(cc.tintTo(.6, 202, 111, 111), cc.tintTo(.6, 206, 154, 114), cc.tintTo(.6, 206, 202, 114), cc.tintTo(.6, 118, 206, 114), cc.tintTo(.6, 114, 188, 206), cc.tintTo(.6, 114, 136, 206), cc.tintTo(.6, 185, 114, 206)));
        this.loadingBg.runAction(act);
    }
})
