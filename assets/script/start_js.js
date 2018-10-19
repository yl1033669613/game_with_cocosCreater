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
            name: 'firework'
        }, {
            title: ' 2048',
            name: 'game2048'
        },{
            title: ' needles',
            name: 'game_needles_start'
        }];
        let y = -30;
        for (let i = 0; i < scenesList.length; i++) {
            let btn = cc.instantiate(this.gameBtnPfb); // 创建节点
            let item = btn.getComponent('game_start_btn');
            this.content.addChild(btn);
            if (i > 0) y -= 65;
            item.updateItem(i, y, scenesList[i].title, scenesList[i].name);
        }
    }
});
