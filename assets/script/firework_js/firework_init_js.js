cc.Class({
    extends: cc.Component,
    properties: {
        canvas: {
            default: null,
            type: cc.Node
        },
        fireworksBody: {
            default: null,
            type: cc.Prefab
        }
    },
    onLoad() {
        this.finger = {
            down: false,
            x: 0,
            y: 0
        };
        // particle color change range
        this.range = 40;
        // particle number
        this.particleMinNum = 30;
        this.particleMaxNum = 100;
        // 生成间隔（帧数间隔，超过10帧才能生成一个）
        this.clickLimiterTotal = 10;
        this.clickLimiterTick = 0;
        // 默认自动生成
        this.timerTotal = 80;
        this.timerTick = 0;

        this.handlerEvents();

        this.node.width = this.canvas.width;
        this.node.height = this.canvas.height;
    },
    back_game_list() {
        cc.director.loadScene('startscene');
    },
    // 事件处理
    handlerEvents() {
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            const startPoint = e.getLocation();
            let x = startPoint.x;
            let y = startPoint.y;

            this.finger.x = x;
            this.finger.y = y;

            this.finger.down = true;
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            const startPoint = e.getLocation();
            let x = startPoint.x;
            let y = startPoint.y;

            this.finger.x = x;
            this.finger.y = y;
        }, this)

        this.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            this.finger.down = false
        }, this);
    },
    createFireworksBody() {
        let fireworksBody = cc.instantiate(this.fireworksBody);
        fireworksBody.width = this.node.width;
        fireworksBody.height = this.node.height;
        this.node.addChild(fireworksBody);
    },
    update(dt) {
        // 固定间隔生成
        if (this.timerTick >= this.timerTotal) {
            if (!this.finger.down) {
                this.createFireworksBody();
                this.timerTick = 0;
            }
        } else {
            this.timerTick++
        };
        // 限制手指触摸发生次数
        if (this.clickLimiterTick >= this.clickLimiterTotal) {
            if (this.finger.down) {
                this.createFireworksBody();
                this.clickLimiterTick = 0;
            }
        } else {
            this.clickLimiterTick++;
        }
    },
});