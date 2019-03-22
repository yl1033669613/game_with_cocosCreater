const gbData = require('./game_global.js');
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
        const globalUser = cc.director.getScene().getChildByName('gameUser').getComponent('game_user_js');

        gbData.freeBestScore = globalUser.userGameInfo.needleFreeModeScore || 0;
        gbData.gameLevel = globalUser.userGameInfo.needleLevelModeLevels || 1;
        gbData.gameLevelData = globalUser.needleLevelData;

        //设置level text
        this.levelBtnLevelTxt.string = 'level '+ gbData.gameLevel +' play';
    },
    levelModeMaskOpen() {
        this.levelModeMask.active = true;
        this.levelModeMask.opacity = 0;
        this.levelModeMask.runAction(cc.sequence(
            cc.scaleTo(0, 0.9, 0.9),
            cc.spawn(cc.scaleTo(0.2, 1, 1), cc.fadeIn(0.3))
        ))
    },
    levelModeMaskClose() {
        this.levelModeMask.runAction(cc.sequence(
            cc.spawn(cc.fadeOut(0.2), cc.scaleTo(0.2, 0.9, 0.9)),
            cc.callFunc(() => {
                this.levelModeMask.active = false;
            }, this)
        ))
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
