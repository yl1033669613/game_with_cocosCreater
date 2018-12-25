cc.Class({
    extends: cc.Component,
    properties: {

    },
    onLoad() {
        cc.director.preloadScene('aircraft_war_game');
    },
    startGame() {
        cc.director.loadScene('aircraft_war_game')
    },
    backList() {
        cc.director.loadScene('startscene')
    }
})
