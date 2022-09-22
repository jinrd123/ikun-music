import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
      day: '',
      month: '',
      recommendList: [],//每日推荐歌曲数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //判断用户是否登录
    let cookie = wx.getStorageSync('cookie');
    if(!cookie) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          wx.reLaunch({
            url:'/pages/login/login'
          })
        }
      })
    }
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
    })
    //获取用户的每日推荐歌曲
    this.getRecommendList(cookie);
  },

  //获取用户每日推荐数据
  async getRecommendList(cookie) {
    let recommendListData = await request('/recommend/songs',{cookie});
    this.setData({
      recommendList: recommendListData.data.dailySongs,
    })
  },

  //跳转至songDetail页面
  toSongDetail(event) {
    let song = event.currentTarget.dataset.song;
    wx.navigateTo({
      //路由传参query参数，携带歌曲id
      url: '/pages/songDetail/songDetail?musicId=' + song.id
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