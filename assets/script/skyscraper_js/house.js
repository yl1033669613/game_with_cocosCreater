const common = require('common');
cc.Class({
    extends: cc.Component,

    properties: {
        colliderSize:cc.size(250,186.5),//碰撞器大小
        houseSize:cc.size(250,250),//碰撞器大小
        spriptAni:cc.Animation,//精灵动画
    },
    onLoad () {
        this.Init();
    },
    Init(){
        this.isFirstIn = true;//第一次接触
        this.isFirstOut = true;//第一次离开
        this.isDestroy = true;//是否允许销毁
        this.isLow = true;//是否允许掉落
        this.y = 0;
        this.node.group = "home";
    },

    update (dt) {
        if(this.isLow){
            if(this.y){
                var d = Math.abs(Math.abs(this.node.y) - Math.abs(this.y));
                if(d>=50 || Math.abs(this.node.rotation) >= 60){
                    this.Drop();
                }
            }
        }
        
    },
    //掉落
    Drop(){
        this.isLow = false;
        this.node.getComponent(cc.RigidBody).gravityScale = 9.8;
        if(common.gm.hp > 0){
            common.gm.hp --;
        }else{
            console.log("你输了！");
        }
        if(common.gm.score > 0){
            common.gm.score --;
        }
        this.node.group = "drop";
        
        common.gm.UpdateUI();
        common.gm.Move();
    },
    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
        
    },
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
        if(this.isFirstIn){
            this.y = selfCollider.node.y;
            selfCollider.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,0);
            this.isFirstIn = false;
            if(otherCollider.tag == 100 && (otherCollider.node.getSiblingIndex()==(common.gm.houses.childrenCount-2))){
                selfCollider.node.getComponent(cc.RigidBody).gravityScale = 1;
                selfCollider.tag = 100;
                common.gm.PutSucceed();
                var selfNode = selfCollider.node;
                var otherNode = otherCollider.node;
                var d = Math.abs(Math.abs(selfNode.x) - Math.abs(otherNode.x));
                if(d<= 3){
                    console.log(d,"完美");
                    common.gm.hp ++;
                    common.gm.UpdateUI();
                }
                // this.scheduleOnce(()=>{
                //     var d = Math.abs(Math.abs(selfNode.x) - Math.abs(otherNode.x));
                //     if(d<= 2){
                //         console.log(d,"完美");
                //         common.gm.hp ++;
                //         common.gm.UpdateUI();
                //     }
                // },0.5);
            }
            if(common.gm.putCount == 1){
                selfCollider.tag = 100;
                selfCollider.node.getComponent(cc.RigidBody).gravityScale = 100;
                common.gm.PutSucceed();
            }
            this.spriptAni.play();
        }
        if(this.isDestroy){
            if((otherCollider.tag == 200 || otherCollider.tag == 201) && common.gm.putCount != 1){
                this.isDestroy = false;
                if(this.isLow){
                    this.Drop();
                }
                var node = selfCollider.node;
                selfCollider.destroy();
                this.scheduleOnce(()=>{
                    node.removeComponent(cc.RigidBody);
                    node.removeComponent(cc.PhysicsBoxCollider);
                    common.gm.poolHouse.put(node);
                },1);
                
                
            }
        }
        
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
        // if(this.isFirstOut){
        //     this.isFirstOut = false;
        //     if(otherCollider.tag == 100 && selfCollider.tag == 101){
        //         common.gm.isSucceed = false;
        //     }
        // }
        //selfCollider.node.getComponent(cc.RigidBody).gravityScale = 9.8;
    }
})
