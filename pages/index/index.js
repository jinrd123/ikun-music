import request from '../../utils/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    recommendList: [],
    topList: [],//排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let bannersData = await request('/banner', {type: 2});
    this.setData({
      banners: bannersData.banners,
    })
    let recommendListData = await request('/personalized', {limit: 10});
    this.setData({
      recommendList: recommendListData.result,
    })
    // 获取排行榜数据
    let resultArr = [];
    for(let i = 0;i < 5;i ++) {
      let topListData = await request('/top/list', {idx: i});
      let topListItem = {name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0,3)};
      resultArr.push(topListItem);
      this.setData({//在这里发送请求增加用户体验，但会增加渲染次数
        topList: resultArr,
      })
    }
    // this.setData({
    //   topList: resultArr,
    // })
    // //在这里发送请求会导致请求完成之前页面白屏时间过长，用户体验差
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