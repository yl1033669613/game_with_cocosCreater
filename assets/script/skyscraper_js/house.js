const common = require('common');
cc.Class({
    extends: cc.Component,
    properties: {
        colliderSize: cc.size(60, 80), //碰撞器大小
        houseSize: cc.size(60, 80), //碰撞器大小
        spriptAni: cc.Animation, //精灵动画
    },
    onLoad() {
        this.Init();
    },
    Init() {
        this.isFirstIn = true; //第一次接触
        this.isFirstOut = true; //第一次离开
        this.isDestroy = true; //是否允许销毁
        this.isLow = true; //是否允许掉落
        this.y = 0;
        this.node.group = "house";
    },
    setRigidBodyActive(bool) {
        this.node.getComponent(cc.RigidBody).active = bool;
    },
    update(dt) {
        if (this.isLow) {
            if (this.y) {
                let d = Math.abs(Math.abs(this.node.y) - Math.abs(this.y));
                if (d >= 50 || Math.abs(this.node.rotation) >= 60) {
                    this.Drop();
                }
            }
        }
    },
    //掉落
    Drop() {
        this.isLow = false;
        this.node.getComponent(cc.RigidBody).gravityScale = 9.8;
        if (common.gm.hp > 0) {
            common.gm.hp--;
        } else {
            console.log("你输了！");
        };
        if (common.gm.score > 0) {
            common.gm.score--;
        };
        this.node.group = "drop";
        common.gm.UpdateUI();
        common.gm.Move();
    },
    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve(contact, selfCollider, otherCollider) {

    },
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, selfCollider, otherCollider) {  
        if (this.isFirstIn) {
            console.log(selfCollider)
            console.log(selfCollider.body.getWorldCenter()) //获取质心 判断是否会下落
            this.y = selfCollider.node.y;
            selfCollider.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0, 0);
            this.isFirstIn = false;
            if (otherCollider.tag == 100 && (otherCollider.node.getSiblingIndex() == (common.gm.housesContainer.childrenCount - 2))) {
                selfCollider.node.getComponent(cc.RigidBody).gravityScale = 1;
                selfCollider.tag = 100;
                common.gm.PutSucceed();
                let selfNode = selfCollider.node;
                let otherNode = otherCollider.node;
                let d = Math.abs(Math.abs(selfNode.x) - Math.abs(otherNode.x));
                if (d <= 3) {
                    console.log(d, "完美");
                    common.gm.hp++;
                    common.gm.UpdateUI();
                }
            };
            if (common.gm.putCount == 1) {
                selfCollider.tag = 100;
                selfCollider.node.getComponent(cc.RigidBody).gravityScale = 100;
                common.gm.PutSucceed()
            };
            // this.spriptAni.play()
        };
        if (this.isDestroy) {
            if ((otherCollider.tag == 200 || otherCollider.tag == 201) && common.gm.putCount != 1) {
                this.isDestroy = false;
                if (this.isLow) {
                    this.Drop();
                }
                let node = selfCollider.node;
                selfCollider.destroy();
                this.scheduleOnce(() => {
                    node.removeComponent(cc.RigidBody);
                    node.removeComponent(cc.PhysicsBoxCollider);
                    common.gm.poolHouse.put(node)
                }, 1)
            }
        }
    },
    onPostSolve(contact, selfCollider, otherCollider) {
        if (selfCollider.tag == 101 && otherCollider.tag == 100) {
            // this.checkDropCallFn = function (e) {
            //     console.log(1111)
            //     // this.unschedule(this.checkDropCallFn)
            // }.bind(this);
            this.unschedule(this.checkDropCallFn);
            this.scheduleOnce(this.checkDropCallFn, 1);
            console.log(selfCollider.node.rotation)
        }
    },
    // checkDropCallFn() {
    //     console.log(1111)
    // }
})
