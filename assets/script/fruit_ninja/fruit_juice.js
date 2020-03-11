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
        this.node.angle = rotation;
        this.juiceSprite.color = color;
        this.juiceSprite.opacity = opacity;
        cc.tween(this.juiceSprite).to(1.5, {opacity: 0}).call(() => {
            this.parentObj.backNode(this.node, this.colorType)
        }).start()
    }
});
