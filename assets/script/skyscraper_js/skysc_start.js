cc.Class({
    extends: cc.Component,
    properties: {

    },
    backTheGameList() {
        cc.director.loadScene('startscene');
    },
    startGame() {
        cc.director.loadScene('skyscraper_game');
    }
})
