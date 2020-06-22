cc.Class({
    extends: cc.Component,
    properties: {
        label: {
            default: null,
            type: cc.Label
        }
    },
    loadGame () {
        const parentC = cc.find("startControler").getComponent('start_js');
        parentC.loadGames(this.url)
    },
    updateItem (idx, y, name, url) {
        this.index = idx;
        this.node.y = y;
        this.label.string = name;
        this.url = url
    }
})
