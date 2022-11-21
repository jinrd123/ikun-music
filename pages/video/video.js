import request from '../../utils/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签数据
    navId: '',//当前选择的导航的标识
    videoList: [],
    videoId: '',//视频的id标识(对应的视频以video标签呈现)
    //videoUpdateTime: [],//里面存放对象，对象记录视频id和视频的播放时长
    isTriggered: false,//scroll-view的下拉刷新状态相关数据
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

  handlePlay(event) {
    //获取被点击的视频的id
    let vid = event.currentTarget.id;
    //更新数据，wx:if和wx:else控制只显示videoId对应的视频，其余为图片
    this.setData({
      videoId: vid,
    })
    //让图片转化成的视频进行播放
    this.videoContext = wx.createVideoContext(vid);


    // //读取视频的播放进度
    // let {videoUpdateTime} = this.data;
    // let videoItem = videoUpdateTime.find(item => item.vid === vid);
    // if(videoItem) {
    //   this.videoContext.seek(videoItem.currentTime);
    // }


    //this.videoContext.play();/*此代码会造成视频切换之后再切回来出现重复视频，而且无法暂停 */
  },

  //监听视频播放进度的回调
  handleTimeUpdate(event) {
    // let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    // let {videoUpdateTime} = this.data;
    // //检查之前的视频播放记录里有没有关于目前播放视频的信息，如果有就更新信息，没有就添加当前视频的播放信息
    // //数组的find方法适合用来查找符合条件的数组元素
    // let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    // if(videoItem) {
    //   videoItem.currentTime = event.detail.currentTime;
    // }else {
    //   videoUpdateTime.push(videoTimeObj);
    // }
    // this.setData({
    //   videoUpdateTime
    // })
  },

  //视频播放结束，移出播放时长的记录
  handleEnded(event) {
    // let {videoUpdateTime} = this.data;
    // videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1);
    // this,setData({
    //   videoUpdateTime,
    // })
  },

  //自定义scroll-view下拉刷新的回调
  handleRefresher() {
    this.getVideoList(this.data.navId);
    this.setData({
      isTriggered: false//关闭下拉刷新
    })
  },

  //自定义scroll-view上拉触底的回调
  handleToLower() {
    //拷贝一份原数组模拟新请求来的新数据
    let {videoList} = this.data;
    let newVideoList = videoList.filter(()=>true);
    //更新data
    videoList.push(...newVideoList);
    this.setData({
      videoList,
    })
  },

  //转跳至搜索页面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
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
    return {
      title: '转发测试',
      page: '/page/video/video',
      imageUrl: '/static/images/nvshen.jpg'
    }
  }
})