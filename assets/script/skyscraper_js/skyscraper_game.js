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
        housesContainer: cc.Node
    },
    onLoad() {
        this.physicsManager = cc.director.getPhysicsManager();
        this.physicsManager.enabled = true;
        this.physicsManager.debugDrawFlags = 1;
        this.physicsManager.attachDebugDrawToCamera(this.camera);

        common.gm = this;

        this.state = 1; //游戏转态 0 未开始， 1 开始， 2 结束
        this.isPut = false; //是否可以放置
        this.putCount = 0; //总放置
        this.isSucceed = true; //放置是否成功
        this.preBlock = '';

        //添加监听
        this.node.on(cc.Node.EventType.TOUCH_END, this.Put, this);

        this.poolHouse = new cc.NodePool();
        this.UpdateUI();
        this.Embarkation()
    },
    //装载
    Embarkation() {
        if (this.putCount > 1) {
            let rgBody = this.preBlock.getComponent(cc.RigidBody);
            rgBody.type = cc.RigidBodyType.Static;
            // this.scheduleOnce(() => {
            //     rgBody.type = cc.RigidBodyType.Static;
            // }, 0.3)
        };
        this.preBlock = this.waitHouse;
        if (this.poolHouse.size() > 0) {
            this.waitHouse = this.poolHouse.get();
        } else {
            this.waitHouse = cc.instantiate(this.preHouse);
        };
        this.waitHouse.getComponent("house").Init();
        this.waitHouse.rotation = 0;
        this.waitHouse.setPosition(cc.p(0, 0));
        this.waitHouse.parent = this.houseBar;
        this.houseJsComp = this.waitHouse.getComponent("house");
        this.isPut = true;
        this.isSucceed = true;
    },
    //放置
    Put(e) {
        console.log()
        if (this.state == 1 && this.isPut) {
            //允许放置
            this.isPut = false;
            this.putCount++;
            this.waitHouse.rotation = 0;
            const rigidbody = this.waitHouse.addComponent(cc.RigidBody); //添加刚体
            const box = this.waitHouse.addComponent(cc.PhysicsBoxCollider); //添加碰撞体

            rigidbody.gravityScale = 9.8;
            rigidbody.enabledContactListener = true;
            rigidbody.type = cc.RigidBodyType.Dynamic;
            box.friction = 1;
            box.size = this.houseJsComp.colliderSize;
            box.tag = 101;
            box.apply();

            this.waitHouse.parent = this.housesContainer;
        }
    },
    //移动
    Move() {
        if (this.putCount > 1) {
            let i = this.score - 1;
            if (i < 0) {
                i = 0;
            };
            let time = this.houseJsComp.colliderSize.height / this.cameraSpeed;

            this.camera.node.stopAllActions();
            this.crane.stopAllActions();

            let actionMove = cc.moveTo(time, cc.p(0, this.houseJsComp.colliderSize.height * i));
            this.crane.runAction(actionMove); //吊机移动
            actionMove = cc.moveTo(time, cc.p(0, this.houseJsComp.colliderSize.height * i));
            this.camera.node.runAction(actionMove); //相机移动
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
        };
        this.Move();
        this.scheduleOnce(() => {
            this.Embarkation()
        }, 0.3)
    },
    //UI面板更新
    UpdateUI() {
        this.hpUi.string = this.hp;
        this.scoreUi.string = this.score
    }
})
