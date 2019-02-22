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
        this.angle = 8;
    },
    craneStrRotate() {
        this.node.stopAllActions();
        this.blockTmpCtn.stopAllActions();
        let action = cc.repeatForever(cc.sequence(
            cc.rotateTo(0, -this.angle).easing(cc.easeQuadraticActionInOut()),
            cc.rotateTo(this.speed / 2, this.angle).easing(cc.easeQuadraticActionInOut()),
            cc.rotateTo(this.speed / 2, -this.angle).easing(cc.easeQuadraticActionInOut())
        ));
        this.node.runAction(action);
        let blockAction = cc.repeatForever(cc.sequence(
            cc.rotateTo(0, this.angle).easing(cc.easeQuadraticActionInOut()),
            cc.rotateTo(this.speed / 2, -this.angle).easing(cc.easeQuadraticActionInOut()),
            cc.rotateTo(this.speed / 2, this.angle).easing(cc.easeQuadraticActionInOut())
        ));
        this.blockTmpCtn.runAction(blockAction)
    },
    switchDifficulty() {
        switch (this.mainGm.succeedPutCount) {
            case 10:
                this.speed = 2.5;
                this.angle = 15;
                this.craneStrRotate();   
                break;
            case 25:
                this.speed = 2;
                this.angle = 20;
                this.craneStrRotate();
                break;
            case 50:
                this.speed = 1.8;
                this.angle = 30;
                this.craneStrRotate();
                break;
            case 100:
                this.speed = 1.2;
                this.angle = 35;
                this.craneStrRotate();
                break;
        }
    }
})
