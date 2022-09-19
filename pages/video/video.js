import request from '../../utils/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签数据
    navId: '',//当前选择的导航的标识
    videoList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getVideoGroupListData();
  },

  // 获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0,14),
      navId: videoGroupListData.data[0].id,
    })

    //获取视频列表数据
    this.getVideoList(this.data.navId);
  },

  //点击切换导航的回调
  changeNav(event) {
    let navId = event.currentTarget.id;
    this.setData({
      navId: navId>>>0,//event.currentTarget.id默认为string类型，所以要把id转回number类型再使用
      //string转number的方法二：navId: navId*1
    })
    this.getVideoList(this.data.navId);
  },

  //获取视频列表数据
  async getVideoList(navId) {
    let videoListData = await request('/video/group', {id: navId, cookie: wx.getStorageSync('cookie')});
    this.setData({
      videoList: videoListData,
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