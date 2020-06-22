const gbData = require('./game_global.js');
const Utils = require('../utils.js');
cc.Class({
    extends: cc.Component,
    properties: {
        levelModeMask: {
            default: null,
            type: cc.Node
        },
        levelBtnLevelTxt: {
            default: null,
            type: cc.Label
        }
    },
    onLoad() {
        cc.director.preloadScene('game_needles')

        gbData.freeBestScore = Utils.GD.userGameInfo.needleFreeModeScore || 0;
        gbData.gameLevel = Utils.GD.userGameInfo.needleLevelModeLevels || 1;
        gbData.gameLevelData = Utils.GD.needleLevelData;

        //设置level text
        this.levelBtnLevelTxt.string = 'level ' + gbData.gameLevel + ' play';
    },
    levelModeMaskOpen() {
        this.levelModeMask.active = true;
        this.levelModeMask.opacity = 1;
        cc.tween(this.levelModeMask).to(0, { scale: .95, opacity: 1 }).to(.3, { scale: 1, opacity: 255 }).start()
    },
    levelModeMaskClose() {
        cc.tween(this.levelModeMask).to(.2, { scale: .95, opacity: 1 }).call(() => {
            this.levelModeMask.active = false;
        }).start()
    },
    freeMode() {
        gbData.mode = 'free';
        cc.director.loadScene('game_needles');
    },
    levelModePlay() {
        gbData.mode = 'level';
        cc.director.loadScene('game_needles');
    },
    backList() {
        cc.director.loadScene('startscene');
    }
})
