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
      videoList: [],//点击切换新的视频数据的时候，清空之前的视频数据（页面空白）,增加用户体验
    })
    //在发请求切换新的视频数据之前显示“正在加载”，增加用户体验(并且在新数据到来之后关闭“正在加载”)
    wx.showLoading({
      title: '正在加载',
      mask: true,//加载过程中使用户点击失效
    });
    this.getVideoList(this.data.navId);
  },

  //获取视频列表数据
  async getVideoList(navId) {
    let videoListData = await request('/video/group', {id: navId, cookie: wx.getStorageSync('cookie')});
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    //由于服务器返回数据格式更改，videoList中无法访问到视频的播放地址（videoList[i].data.urlInfo为null），所以我们需要利用videoListData中的视频id再次发请求获取视频播放地址
    //完善videoList[i].data.urlInfo数据
    for(let i = 0;i < videoList.length;i ++){
      let videoUrl = await request('/video/url',{id: videoList[i].data.vid});
      videoList[i].data.urlInfo = videoUrl.urls[0].url;
    }
    //这里相当于新数据已经准备就绪，可以关闭“正在加载”提示框了
    wx.hideLoading();
    this.setData({
      videoList,
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