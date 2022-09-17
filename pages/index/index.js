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
    //由于接口更新，通过toplist接口先获取排行榜的id号，官方撤销了排行榜单独的接口（官方解释：排行榜也是歌单的一种）
    let topList = await request('/toplist');//获取排行榜的相关信息
    let idArr = [];//收集排行榜作为歌单的id
    for(let i = 0;i < 5;i ++) {
      idArr.push(topList.list[i].id);
    }
    let resultArr = [];
    for(let i = 0;i < 5;i ++) {
      let topListData = await request('/playlist/detail', {id: idArr[i]});//利用/playlist/detail接口可以访问指定id的歌单，用排行榜的id访问排行榜的详细信息
      let topListItem = {name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0,3)};
      resultArr.push(topListItem);
      this.setData({
        topList: resultArr,
      })
    }
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