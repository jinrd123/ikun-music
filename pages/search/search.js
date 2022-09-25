import request from '../../utils/request';
let isSending = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',//placeholder的内容
    hotList: [],//热搜榜数据
    searchContent: '',//用户输入的表单项数据
    searchList: [],//关键字模糊匹配的数据
    historyList: [],//搜索历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //初始化数据
    this.getInitData();
    //初始化本地搜索记录
    this.getSearchHistory();
  },

  //获取初始化的数据
  async getInitData() {
    let placeholderData = await request('/search/default');
    let hotListData = await request('/search/hot/detail');
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data,
    })
  },

  //表单内容发生改变的回调
  handleInputChange(event) {
    //更新searchContent的状态数据
    this.setData({
      searchContent: event.detail.value.trim(),
    })

    //请求函数进行防抖优化处理
    clearTimeout(isSending);
    isSending = setTimeout(()=>{
      //发请求获取关键字模糊匹配的数据
      this.getSearchList();
    },300);
  },


  //表单内容改变时获取关键字模糊匹配的请求方法
  async getSearchList() {
    //防止无内容搜索请求导致请求参数不足报错
    if(!this.data.searchContent) {
      return;
    }
    let {historyList, searchContent} = this.data;
    let searchListData = await request('/search', {keywords: searchContent, limit: 10});
    this.setData({
      searchList: searchListData.result.songs,
    })
    //将搜索的关键字添加到搜索历史记录中
    if(historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent),1);
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList,
    })
    wx.setStorageSync('searchHistory',historyList);
  },

  //获取本地历史记录的功能函数
  getSearchHistory() {
    let historyList = wx.getStorageSync('searchHistory');
    if(historyList) {
      this.setData({
        historyList,
      })
    }
  },

  //清除搜索输入框的内容
  clearSearchContent() {
    this.setData({
      searchContent: '',
      searchList: [],
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