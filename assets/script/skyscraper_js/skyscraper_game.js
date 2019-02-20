const common = require('common');
cc.Class({
    extends: cc.Component,

    properties: {
        houseBar: cc.Node, //待放置的存放容器
        preHouse: cc.Prefab, //房子的预置
        camera: cc.Camera, //相机
        cameraSpeed: 200, //相机速度
        crane: cc.Node, //吊机
        hpUi: cc.Label, //生命
        scoreUi: cc.Label, //分数
        hp: 0, //生命
        score: 0, //分数
        houses: cc.Node,
        closeShot: cc.Node, //近景
        distantView: cc.Node, //远景
        cloud: cc.Node, //云端
        cloudScore: 15, //云端出现分数
    },
    onLoad() {
        this.Init();
    },
    update(dt) {

    },
    //初始化
    Init() {
        this.physicsManager = cc.director.getPhysicsManager();
        this.physicsManager.enabled = true;
        this.physicsManager.debugDrawFlags = 1;
        this.physicsManager.attachDebugDrawToCamera(this.camera);

        common.gm = this;

        this.state = 1; //游戏转态 0 未开始， 1 开始， 2 结束
        this.isPut = false; //是否可以放置
        this.putCount = 0; //总放置
        this.isSucceed = true; //放置是否成功

        //添加监听
        this.node.on(cc.Node.EventType.TOUCH_END, this.Put, this);
        //初始化房子的对象池
        this.poolHouse = new cc.NodePool();
        // this.cloudCol = this.cloud.getComponent("clouds");
        this.UpdateUI();
        this.Embarkation();
    },
    //装载
    Embarkation() {
        if (this.poolHouse.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            this.waitHouse = this.poolHouse.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            this.waitHouse = cc.instantiate(this.preHouse);
        }
        this.waitHouse.getComponent("house").Init();
        this.waitHouse.rotation = 0;
        this.waitHouse.setPosition(cc.p(0, 0));
        this.waitHouse.parent = this.houseBar;
        this.housesCol = this.waitHouse.getComponent("house");
        this.isPut = true;
        this.isSucceed = true;
    },

    //放置
    Put(e) {
        if (this.state == 1 && this.isPut) {
            //允许放置
            this.isPut = false;
            this.putCount++;
            var rigidbody = this.waitHouse.addComponent(cc.RigidBody); //添加刚体
            var box = this.waitHouse.addComponent(cc.PhysicsBoxCollider); //添加碰撞体

            rigidbody.gravityScale = 9.8;
            rigidbody.enabledContactListener = true;
            rigidbody.type = cc.RigidBodyType.Dynamic;
            box.friction = .01;
            box.size = this.housesCol.colliderSize;
            box.tag = 101;
            box.apply();

            this.waitHouse.parent = this.houses;
        }
    },

    //移动
    Move() {
        if (this.putCount > 1) {
            var i = this.score - 1;
            if (i < 0) {
                i = 0;
            }
            var time = this.housesCol.colliderSize.height / this.cameraSpeed;

            this.camera.node.stopAllActions();
            this.crane.stopAllActions();
            this.closeShot.stopAllActions();
            this.distantView.stopAllActions();
            // this.cloud.stopAllActions();

            var actionMove = cc.moveTo(time, cc.p(0, this.housesCol.colliderSize.height * i));
            this.crane.runAction(actionMove); //吊机移动
            actionMove = cc.moveTo(time, cc.p(0, this.housesCol.colliderSize.height * i));
            this.camera.node.runAction(actionMove); //相机移动
            var actionMove = cc.moveTo(time, cc.p(0, this.housesCol.colliderSize.height * i * -0.6));
            this.closeShot.runAction(actionMove);//近景移动
            actionMove = cc.moveTo(time,cc.p(0,this.housesCol.colliderSize.height * i * -0.1));
            this.distantView.runAction(actionMove);//远景移动
            // var actionMove = cc.moveTo(time,cc.p(0,this.housesCol.colliderSize.height * i * -0.6));
            // this.cloud.runAction(actionMove);//云移动
        }
    },
    //放置成功
    PutSucceed() {
        if (this.isSucceed) {
            console.log("放置成功！");
            this.score++;
            this.UpdateUI();
        } else {
            console.log("放置失败！");
        }
        this.Move();
        this.scheduleOnce(() => {
            this.Embarkation();
        }, 0.5);
    },

    //UI面板更新
    UpdateUI() {
        this.hpUi.string = this.hp;
        this.scoreUi.string = this.score;
        // if (this.score >= this.cloudScore) {
        //     console.log("耸入云端");
        //     this.cloudCol.Play();
        // } else {
        //     this.cloudCol.Stop();
        // }
    }
})
