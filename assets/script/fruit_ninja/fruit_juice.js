 cc.Class({
    extends: cc.Component,

    properties: {
        juiceSprite: {
            default: null,
            type: cc.Node
        }
    },

    onLoad() {
        this.parentObj = this.node.parent.getComponent('fruit_juice_group');
    },
    init(rotation, color, opacity) {
        this.node.rotation = rotation;
        this.juiceSprite.color = color;
        this.juiceSprite.opacity = opacity;
        this.juiceSprite.runAction(cc.sequence(cc.fadeOut(1.5), cc.callFunc(() => {
            this.parentObj.backNode(this.node, this.colorType)
        }, this)));
    }
});
