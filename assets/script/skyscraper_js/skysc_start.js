cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad() {
        cc.director.preloadScene('skyscraper_game');
    },
    backTheGameList() {
        cc.director.loadScene('startscene');
    },
    startGame() {
        cc.director.loadScene('skyscraper_game');
    }
})
