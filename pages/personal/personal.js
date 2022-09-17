let startY = 0;//手指起始坐标
let moveY = 0;//手指移动过程中的坐标
let moveDistance = 0;//手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 作为样式值
    coverTransform: 'translateY(0rpx)',
    coverTransition: '',
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo),
      })
    }
  },
  handleTouchStart(event) {
    //下拉时需要清除曾经添加的过渡效果
    this.setData({
      coverTransition: '',
    })
    //获取手指起始坐标
    startY = event.touches[0].clientY;//第一个手指的垂直坐标（屏幕顶部clientY为0）
  },
  handleTouchMove(event) {
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;
    //不可向上移动
    if(moveDistance <= 0) {
      return;
    }
    //最多向下移动限制
    if(moveDistance >= 80) {
      moveDistance = 80;
    }
    //动态更新coverTransform的值，从而引起元素样式的变化
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`,
    })
  },
  handleTouchEnd() {
    //手指离开复原元素位置并添加过渡效果
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coverTransition: 'transform 0.5s linear',
    })
  },
  //跳转至登录（login）页面的回调
  toLogin() {
    //页面跳转
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})