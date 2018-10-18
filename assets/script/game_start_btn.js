cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        }
    },

    loadGame () {
        if (this.url) {
            cc.director.loadScene(this.url);
        }
    },

    updateItem (idx, y, name, url) {
        this.index = idx;
        this.node.y = y;
        this.label.string = name;
        this.url = url;
    }
});
