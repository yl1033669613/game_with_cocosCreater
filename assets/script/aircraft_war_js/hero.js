const D = require('globals');

cc.Class({
    extends: cc.Component,

    properties: () => ({
        blowupani: {
            default: null,
            type: cc.Prefab,
            tooltip: '爆炸动画',
        },
        main: {
            default: null,
            type: require('main'),
        },
        bulletGroup: {
            default: null,
            type: require('bulletGroup'),
        }
    }),

    onLoad() {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.eState = D.commonInfo.gameState.none;
        this.onDrag()
    },
    //添加拖动监听
    onDrag() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.dragMove, this);
    },
    //去掉拖动监听
    offDrag() {
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.dragMove, this);
    },
    //拖动
    dragMove(event) {
        let locationv = event.getLocation();
        let location = this.node.parent.convertToNodeSpaceAR(locationv);
        //飞机不移出屏幕 
        let minX = -this.node.parent.width / 2 + this.node.width / 2;
        let maxX = -minX;
        let minY = -this.node.parent.height / 2 + this.node.height / 2;
        let maxY = -minY;
        if (location.x < minX) {
            location.x = minX;
        }
        if (location.x > maxX) {
            location.x = maxX;
        }
        if (location.y < minY) {
            location.y = minY;
        }
        if (location.y > maxY) {
            location.y = maxY;
        }
        this.node.setPosition(location);
    },
    //碰撞监测
    onCollisionEnter(other, self) {
        if (other.node.group == 'ufo') {
            if (other.node.name == 'ufoBullet') {
                this.bulletGroup.changeBullet(other.node.name);
            } else if (other.node.name == 'ufoBomb') {
                this.main.getUfoBomb();
            }
        } else if (other.node.group == 'enemy') {
            //播放动画
            let po = this.node.getPosition();
            let blowup = cc.instantiate(this.blowupani);
            this.node.parent.addChild(blowup);
            blowup.setPosition(po);
            let animation = blowup.getComponent(cc.Animation);
            animation.on('finished', this.onFinished, blowup);
            //清除节点
            this.node.destroy();
            //更新分数 
            this.main.gameOver();
        } else {
            return false;
        }
    },
    onFinished(event) { //动画结束后
        this.destroy()
    }
})
