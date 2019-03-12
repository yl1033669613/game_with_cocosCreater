cc.Class({
    extends: cc.Component,
    properties: {
        complFruit: {
            default: null,
            type: cc.Node
        },
        splitAni: {
            default: null,
            type: cc.Node
        },
        forceMin: 30000,
        forceMax: 50000
    },
    onLoad () {

    },
    start () {

    },
    init() {
        let fruitNodeRigidBody = this.node.getComponent(cc.RigidBody);
        fruitNodeRigidBody.applyForceToCenter(cc.p(1500, 30000), true);
        fruitNodeRigidBody.applyTorque(100, true);
    }
});
