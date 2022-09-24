import PubSub from 'pubsub-js';
import moment from 'moment';
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
    musicLink: '',//音乐播放链接，优化播放暂停时（防止重复发请求）使用
    currentTime: '00:00',//当前播放进度
    durationTime: '00:00',//音乐总时长
    currentWidth: 0,//实时进度条的宽度
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
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId == musicId) {
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
    //监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(()=>{
        //自动切换至下一首音乐
        PubSub.publish('switchType','next');
        //将实时进度条长度还原成0
        this.setData({
          currentWidth: 0,
          currentTime: '00:00',
        })
    });
    
    //原本属于切歌的回调函数中，移动到这里
    PubSub.subscribe('musicId', (msg, musicId) => {
      this.setData({
        musicId,
        isPlay: true,
      })
      //修改app.js中存储的歌曲播放状态
      this.updataApp(musicId, true);
      //获取音乐详情信息
      this.getMusicInfo(musicId);
      //切换歌曲之后默认为播放状态
      this.musicControl(true,musicId);
    })

    //点开一首歌曲自动开始播放
    this.musicControl(true, musicId);

    //监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(()=>{
      //格式化实时播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format("mm:ss");
      //进度条实时宽度
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450;
      this.setData({
        currentTime,
        currentWidth,
      })
    })

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

    let {musicId, musicLink} = this.data;
    //处理音乐播放与暂停
    this.musicControl(isPlay, musicId, musicLink);
    //更新app.js中的数据
    this.updataApp(musicId, true);
  },

  //获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {ids: musicId})
    //利用moment库将毫秒转化成指定格式的字符串
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime,
    })
    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    })
  },

  //控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink) {
    if(isPlay) {//处理音乐播放
      if(!musicLink) {
        let musicLinkData = await request('/song/url', {id: musicId})
        musicLink = musicLinkData.data[0].url;
      }
      this.setData({
        musicLink,
      })
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

    //发布消息数据给recommendSong页面
    PubSub.publish('switchType', type);
  },

  //更新app.js中存放的音乐播放信息
  updataApp(musicId, isMusicPlay) {
    getApp().globalData.musicId = musicId;
    getApp().globalData.isMusicPlay = isMusicPlay;
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