const common = require('common');
cc.Class({
    extends: cc.Component,

    properties: {
        preClouds:[cc.Prefab],//云数组
        createSpeed:2,//生成速度
        isPlay:false,//是否开始
    },

    onLoad(){
        this.Init();
    },

    onEnable() {
        
    },
    onDisable() {
        
    },
    
    update (dt) {
        if(this.isPlay){
            this.t += dt;
            if(this.t >= this.createSpeed){
                this.t = 0;
                //创建云
                this.Create();
            }
        }
        
    },

    Init(){
        this.clouds = [];//生成出来的云
        this.t = 0;//用于帧事件计算时间
        this.width = cc.winSize.width;
        this.height = cc.winSize.height;
        //this.Play();
        //创建云对象池数组
        this.pool = [];
        this.preClouds.forEach(e => {
            var p = new cc.NodePool();
            this.pool.push(p);
        });

    },

    //创建云
    Create(){
        var ranIndex = Math.floor(Math.random()*this.preClouds.length);

        if(this.pool[ranIndex].size() >0){
            var cloud = this.pool[ranIndex].get();//随机生成云
        }else{
            var cloud = cc.instantiate(this.preClouds[ranIndex]);//随机生成云
        }
        
        var x = this.width/2+cloud.width;
        var y = Math.floor(Math.random() * (common.gm.camera.node.y+(this.height / 2)) + (common.gm.camera.node.y-(this.height / 2)));
        var createPos = cc.p(x,y);//生成位置
        this.node.addChild(cloud);
        cloud.setPosition(createPos);
        var time = Math.floor(Math.random() * 20 + 10);
        var move = cc.moveBy(time,(this.width+cloud.width+(cloud.width/2))*-1,0);
        cloud.runAction(move);
        this.clouds.push(cloud);
        this.scheduleOnce(()=>{
            this.pool[ranIndex].put(cloud);
        },time);
        console.log(cloud.y,common.gm.camera.node.y);
    },
    //开始
    Play(){
        this.isPlay = true;
        this.t = this.createSpeed;
    },
    //暂停
    Pause(){
        this.isPlay = false;
    },
    //结束
    Stop(){
        this.isPlay = false;
        this.t = 0;
    }
})
