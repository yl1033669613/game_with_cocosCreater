const globals = require('skysc_globals');
cc.Class({
    extends: cc.Component,
    properties: {
        colliderSize: cc.size(55, 58), //默认大小
        spriptAni: cc.Animation,
    },
    onLoad() {
        this.idx = 0;
        this.timer = null
    },
    init() {
        this.isFirstIn = true;
        this.isFirstOut = true;
        this.isDestroy = true;
        this.node.group = "skyscBlock";
        this.colliderSize = globals.gm.putCount == 0 ? cc.size(100, 58) : cc.size(45 + Math.round((65 - 45) * Math.random()), 58);
        this.node.width = this.colliderSize.width;
    },
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.isFirstIn) {
            this.isFirstIn = false;
            selfCollider.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
            if (globals.gm.putCount == 1) {
                selfCollider.node.getComponent(cc.RigidBody).gravityScale = 100;
                globals.gm.handleResult();
            };
            this.spriptAni.play();
        };
        if (this.isDestroy) {
            if ((otherCollider.tag === 200 || otherCollider.tag === 100) && globals.gm.putCount !== 1) {
                this.isDestroy = false;
                let node = selfCollider.node;
                if (this.isFirstOut) {
                    this.isFirstOut = false;
                    this.checkHp()
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
        const self = this;
        clearTimeout(self.timer);
        self.timer = setTimeout(() => {
            if (selfCollider.tag === 101 && otherCollider.tag === 102) {
                if (self.isFirstOut) {
                    self.isFirstOut = false;
                    selfCollider.node.angle = 0; // 摆正位置
                    let selfNode = selfCollider.body.getWorldCenter();
                    let otherNode = otherCollider.body.getWorldCenter();
                    let d = Math.abs(Math.abs(selfNode.x) - Math.abs(otherNode.x));
                    if (d <= otherCollider.node.width / 2) {
                        self.idx = globals.gm.succeedPutCount + 1;
                        globals.gm.handleResult(d <= 3)
                    } else {
                        self.checkHp()
                    }
                }
            }
        }, 200)
    },
    checkHp() {
        if (globals.gm.hp > 0) {
            globals.gm.hp--;
            if (globals.gm.hp == 0) {
                globals.gm.updateUi();
                globals.gm.gameOverHandle();
            } else {
                globals.gm.isSucceed = false;
                globals.gm.handleResult()
            }
        }
    }
})
