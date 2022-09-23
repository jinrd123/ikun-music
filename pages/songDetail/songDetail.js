import PubSub from 'pubsub-js';
import request from '../../utils/request';
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//判断音乐是否正在播放，控制动画效果
    song: {},//歌曲详情对象
    musicId: '',//音乐id，获取歌曲详情、歌曲播放地址使用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let musicId = options.musicId;
    //将musicId更新至data中（公共区），因为请求歌曲播放地址时还需要使用
    this.setData({
      musicId,
    })

    //判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      this.setData({
        isPlay: true,
      })
    }

    //获取音乐详情信息
    this.getMusicInfo(musicId);
    //创建控制音乐播放的实例(这个实例一旦设置了src属性和title属性，就会自动播放src指定播放地址的歌曲)
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onPlay(()=>{
      this.changePlayState(true);
      appInstance.globalData.musicId = musicId;
      appInstance.globalData.isMusicPlay = true;
    });
    this.backgroundAudioManager.onPause(()=>{
      this.changePlayState(false);
      appInstance.globalData.isMusicPlay = false;
    });
    //当用户点击关闭悬窗
    this.backgroundAudioManager.onStop(()=>{
      this.changePlayState(false);
      appInstance.globalData.isMusicPlay = false;
    });
  },

  //修改音乐播放状态
  changePlayState(isPlay) {
    this.setData({
      isPlay,
    })
  },

  //点击播放/暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    /*
    在onLoad中通过音乐控制对象设置了对音乐播放、暂停的监视，会自动更新isPlay状态
    //修改播放状态
    this.setData({
      isPlay
    })
    */

    let {musicId} = this.data;
    //处理音乐播放与暂停
    this.musicControl(isPlay, musicId);
  },

  //获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {ids: musicId})
    this.setData({
      song: songData.songs[0],
    })
    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    })
  },

  //控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId) {
    if(isPlay) {//处理音乐播放
      let musicLinkData = await request('/song/url', {id: musicId})
      let musicLink = musicLinkData.data[0].url;
      this.backgroundAudioManager.title = this.data.song.name;
      this.backgroundAudioManager.src = musicLink;
    }else {
      this.backgroundAudioManager.pause();
    }
  },


  //点击切歌的回调
  handleSwitch(event) {
    let type = event.currentTarget.id;
    //关闭当前播放的音乐
    this.backgroundAudioManager.stop();
    //在消息发布之前订阅recommendSong页面的消息（准备接收）
    PubSub.subscribe('musicId', (msg, musicId) => {
      this.setData({
        musicId,
        isPlay: true,
      })
      //获取音乐详情信息
      this.getMusicInfo(musicId);
      //切换歌曲之后默认为播放状态
      this.musicControl(true,musicId);
      //取消订阅
      PubSub.unsubscribe('musicId');
    })

    //发布消息数据给recommendSong页面
    PubSub.publish('switchType', type);
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