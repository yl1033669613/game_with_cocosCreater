cc.Class({
    extends: cc.Component,
    properties: {

    },
    onLoad() {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },
    onCollisionEnter(other, self) {
        if (self.node.group == 'enemy') {
            let enemyObj = this.node.parent.getComponent('enemy');
            if (other.node.group == 'heroBullet') {
                let bullet = other.node.getComponent('bullet');
                if (enemyObj.hP > 0) {
                    enemyObj.hP -= bullet.hpDrop
                } else {
                    return
                };
                if (enemyObj.hP <= 0) {
                    this.node.group = 'default';
                    enemyObj.enemyOver()
                };
                return
            };
            if (other.node.group == 'hero') {
                enemyObj.hP = 0;
                enemyObj.enemyOver('isHero');
                return
            }
        }
    }
});
