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
        // console.log(this.circleGroup)
    },  
    gameInit() {

    },
    startGame() {
        this.gameMask.active = false
    },
    update (dt) {

    }
})
