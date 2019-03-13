const utils = require('../utils');
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
        forceHorzMin: 0,
        forceHorzMax: 1000,
        forceMin: 30000,
        forceMax: 35000
    },
    onLoad() {
        this.poolName = '';
        this.parent = this.node.parent.getComponent('fruit_ninja_group');
        this.ani = this.splitAni.getComponent('cc.Animation');
    },
    init(poolName) {
        this.poolName = poolName;
        this.isCut = false;
        this.complFruit.active = true;
        this.splitAni.active = false;
        this.recoveryAniFirstFps();
        let fruitNodeRigidBody = this.node.getComponent(cc.RigidBody);
        let forceY = Math.floor(utils.random(this.forceMin, this.forceMax)),
            forceX = Math.floor(utils.random(this.forceHorzMin, this.forceHorzMax));
        fruitNodeRigidBody.angularVelocity = utils.random(-1, 1) > 0 ? 100 : -100; //角速度 默认100
        fruitNodeRigidBody.applyForceToCenter(cc.p(this.node.x > 0 ? -forceX : forceX, forceY), true);
    },
    onCollisionEnter(other, self) {
        if (other.tag == 50) {
            if (!this.isCut) this.playSplitAni();
            this.isCut = true;
        };
        if (other.tag == 100) {
            this.backThisNode();
            this.parent.checkRemain()
        };
    },
    playSplitAni() {
        this.complFruit.active = false;
        this.splitAni.active = true;
        this.ani.play();
    },
    recoveryAniFirstFps() { //恢复动画的初始帧位置
        let aniName = this.ani.getClips()[0].name;
        let state = this.ani.getAnimationState(aniName);
        let curves = state.curves;
        let info = state.getWrappedInfo(0.01);
        for (let i = 0, len = curves.length; i < len; i++) {
            let curve = curves[i];
            curve.sample(info.time, info.ratio, this);
        }
    },
    backThisNode() {
        utils.backObjPool(this.parent, this.poolName, this.node);
    }
});
