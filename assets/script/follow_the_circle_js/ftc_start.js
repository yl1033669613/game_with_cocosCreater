cc.Class({
    extends: cc.Component,
    properties: () => ({
        gameMask: {
            default: null,
            type: cc.Node
        },
        circleGroup: {
            default: null,
            type: require('circle_group')
        }
    }),
    onLoad() {

    },
    startGame() {
        this.showGameMask(false);
        this.circleGroup.startCreateCircles();
    },
    showGameMask(bool) {
        this.gameMask.active = bool;
        let action;
        if (bool) {
            this.gameMask.opacity = 0;
            action = cc.fadeIn(.3);
        } else {
            action = cc.fadeOut(.3);
        };
        this.gameMask.runAction(action);
    },
    tapCloseBtnToQuitThisGame() {
        this.circleGroup.handleGameOver();
    },
    backList() {
        cc.director.loadScene('startscene');
    }
})
