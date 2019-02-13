cc.Class({
    extends: cc.Component,
    properties: {
        //上方管子最小高度
        topPipeMinHeight: 100,
        //下方管子最小高度
        bottomPipeMinHeight: 100,
        //上、下管子垂直间距最小值
        spacingMinValue: 150,
        //上、下管子垂直间距最大值
        spacingMaxValue: 200,
        //上方管子节点
        topPipe: cc.Node,
        //下方管子节点
        bottomPipe: cc.Node,
    },
    init(pipeManager) {
        this.pipeManager = pipeManager;
        this.initPositionX();
        this.initPositionY();
    },
    // 设置节点在x轴的初始位置
    initPositionX() {
        const visibleSize = cc.director.getVisibleSize(); // 场景可见区域大小
        let sceneLeft = -visibleSize.width / 2;
        let sceneRight = visibleSize.width / 2;
        this.node.x = sceneRight + 300;
        this.recylceX = sceneLeft - Math.max(this.topPipe.width, this.bottomPipe.width);
    },
    // 设置上、下管道y轴位置以及之间的距离 
    initPositionY() {
        const visibleSize = cc.director.getVisibleSize();
        let topPipeMaxY = visibleSize.height / 2 - this.topPipeMinHeight;
        let bottomPipeMinY = cc.find("Canvas/ground").y + cc.find("Canvas/ground").height / 2 + this.bottomPipeMinHeight; // Prefab不能通过属性检查器获取节点，只能动态查找
        let spacing = this.spacingMinValue + Math.random() * (this.spacingMaxValue - this.spacingMinValue);
        this.topPipe.y = topPipeMaxY - Math.random() * (topPipeMaxY - bottomPipeMinY - spacing);
        this.bottomPipe.y = this.topPipe.y - spacing;
    },
    update(dt) {
        if (!this.pipeManager.isRunning) {
            return;
        }
        // 实时更新管道位置
        this.node.x += this.pipeManager.pipeMoveSpeed * dt;
        // 超出屏幕显示范围了，就可以回收本对象了
        if (this.node.x < this.recylceX) {
            this.pipeManager.recyclePipe(this);
        }
    }
})
