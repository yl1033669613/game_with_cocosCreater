// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        gameBtnPfb: {
            default: null,
            type: cc.Prefab
        },
        content: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let scenesList = [{
            title: ' snake',
            name: 'snake'
        }, {
            title: ' flappy bird',
            name: 'flappy_bird'
        }, {
            title: ' firework',
            name: ''
        }];
        let y = -30;
        for (let i = 0; i < scenesList.length; i++) {
            let btn = cc.instantiate(this.gameBtnPfb); // 创建节点
            let item = btn.getComponent('game_start_btn');
            this.content.addChild(btn);
            if (i > 0) y -= 65;
            item.updateItem(i, y, scenesList[i].title, scenesList[i].name);
        }
    },

    start() {

    },

    // update (dt) {},
});
