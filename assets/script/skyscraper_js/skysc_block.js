const globals = require('skysc_globals');
cc.Class({
    extends: cc.Component,
    properties: {
        colliderSize: cc.size(55, 58), //默认大小
        spriptAni: cc.Animation,
    },
    onLoad() {
        this.init();
    },
    init() {
        this.isFirstIn = true;
        this.isFirstOut = true;
        this.isDestroy = true;
        this.node.group = "skyscBlock"
    },
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.isFirstIn) {
            selfCollider.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0, 0);
            this.isFirstIn = false;
            if (globals.gm.putCount == 1) {
                selfCollider.node.getComponent(cc.RigidBody).gravityScale = 100;
                globals.gm.handleResult()
            };
            this.spriptAni.play()
        };
        if (this.isDestroy) {
            if (otherCollider.tag == 200 && globals.gm.putCount != 1) {
                this.isDestroy = false;
                let node = selfCollider.node;
                if (this.isFirstOut) {
                    this.isFirstOut = false;
                    this.checkHp();
                };
                selfCollider.destroy();
                this.scheduleOnce(() => {
                    node.removeComponent(cc.RigidBody);
                    node.removeComponent(cc.PhysicsBoxCollider);
                    globals.gm.backObjPool(node)
                }, 1.2)
            }
        }
    },
    onPostSolve(contact, selfCollider, otherCollider) {
        if (selfCollider.tag == 101 && otherCollider.tag == 102) {
            this.unschedule(this.checkDropCallFn);
            this.checkDropCallFn = function(e) {
                if (this.isFirstOut) {
                    this.isFirstOut = false;
                    let selfNode = selfCollider.body.getWorldCenter();
                    let otherNode = otherCollider.body.getWorldCenter();
                    // console.log(selfNode, otherNode)
                    let d = Math.abs(Math.abs(selfNode.x) - Math.abs(otherNode.x));
                    if (d <= otherCollider.node.width / 2) {
                        let isPrefect = false;
                        if (d <= 3) {
                            isPrefect = true;
                        };
                        globals.gm.handleResult(isPrefect);
                    } else {
                        this.checkHp()
                    }
                }
            }.bind(this);
            this.scheduleOnce(this.checkDropCallFn, 0.2);
        }
    },
    checkHp() {
        if (globals.gm.hp > 0) {
            globals.gm.hp--;
            if (globals.gm.hp == 0) {
                globals.gm.updateUi();
                globals.gm.gameOverHandle()
            } else {
                globals.gm.isSucceed = false;
                globals.gm.handleResult()
            }
        }
    }
})
