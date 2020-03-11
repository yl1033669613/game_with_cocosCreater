cc.Class({
    extends: cc.Component,
    properties: () => ({
        blockTmpCtn: {
            default: null,
            type: cc.Node
        },
        mainGm: {
            default: null,
            type: require('skyscraper_game')
        }
    }),
    onLoad() {
        this.speed = 3;
        this.curAngle = 8;
    },
    craneStrRotate() {
        cc.tween(this.node).stop();
        cc.tween(this.blockTmpCtn).stop();
        cc.tween(this.node)
            .repeatForever(
                cc.tween().to(0, { angle: -this.curAngle }, { easing: 'quadInOut' })
                .to(this.speed / 2, { angle: this.curAngle }, { easing: 'quadInOut' })
                .to(this.speed / 2, { angle: -this.curAngle }, { easing: 'quadInOut' })
            )
            .start()
        cc.tween(this.blockTmpCtn)
            .repeatForever(
                cc.tween().to(0, { angle: this.curAngle }, { easing: 'quadInOut' })
                .to(this.speed / 2, { angle: -this.curAngle }, { easing: 'quadInOut' })
                .to(this.speed / 2, { angle: this.curAngle }, { easing: 'quadInOut' })
            )
            .start()
    },
    switchDifficulty() {
        switch (this.mainGm.succeedPutCount) {
            case 8:
                this.speed = 2.5;
                this.curAngle = 15;
                this.craneStrRotate();
                break;
            case 20:
                this.speed = 2;
                this.curAngle = 20;
                this.craneStrRotate();
                break;
            case 40:
                this.speed = 1.8;
                this.curAngle = 25;
                this.craneStrRotate();
                break;
            case 60:
                this.speed = 1.5;
                this.curAngle = 28;
                this.craneStrRotate();
                break;
            case 100:
                this.speed = 1.2;
                this.curAngle = 28;
                this.craneStrRotate();
                break;
        }
    }
})
