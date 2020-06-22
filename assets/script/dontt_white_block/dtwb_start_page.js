cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad() {
        cc.director.preloadScene('dontt_white_block');
    },
    backTheGameList() {
        cc.director.loadScene('startscene');
    },
    startGame() {
        cc.director.loadScene('dontt_white_block');
    }
})
