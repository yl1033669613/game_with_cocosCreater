// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async(event, context) => {
  try {
    let user = await db.collection('user').where({
      userOpenId: event.userInfo.openId
    }).get();
    if (user.data.length == 0) {
      let id = await db.collection('user').add({
        data: {
          userOpenId: event.userInfo.openId
        }
      })
    };
    return {
      openid: event.userInfo.openId,
      isRegistered: user.data.length > 0
    }
  } catch (e) {
    console.log(e)
  }
}