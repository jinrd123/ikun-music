# first commit

## 1.设置全局导航栏的背景颜色、字体颜色、文本内容

app.json:

~~~js
"window": {
	"navigationBarBackgroundColor": "#d43c33",
	"navigationBarTextStyle": "white",
	"navigationBarTitleText": "硅谷云音乐"
}
~~~

# second commit

## 1.轮播图基本结构

~~~js
  <swiper>
    <swiper-item>
      ...
    </swiper-item>
	...
    <swiper-item>
      ...
    </swiper-item>
  </swiper>
~~~

类转化到本地

app.wxss全局引入样式

给text添加类iconfont和对应类

## 2.“五个图标”导航栏的实现

* 引入阿里图标
  1. 用Font class形式生成图标代码，在/static/iconfont下创建iconfont.wxss文件保存css代码
  2. 在app.wxss中引入图标代码为全局所用：`@import "/static/iconfont/iconfont.wxss";`
  3. 给相应标签添加iconfont类和与图标符号对应的类名：`<text class="iconfont icon-tuijian"></text>`

# third commit

## 1.单行文本溢出隐藏（省略号代替）

给需要单行文本溢出的**块级元素**添加样式：

(非块级元素大小由内容决定，不会有文本溢出情况，overflow:hidden失效)

~~~css
.block {
    /*非块级元素需设置为块级元素*/
    display: block;
    /*设置文本不换行*/
	white-space: nowrap;
    /*溢出部分隐藏*/
    overflow: hidden;
    /*隐藏内容用省略号代替*/
    text-overflow: ellipsis;
}
~~~

## 2.多行文本溢出

~~~css
overflow: hidden;
text-overflow: ellipsis;
display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 2;
~~~

# fourth commit

小程序的运行环境不同于浏览器，会自动用当前项目路径补全请求路径，所以小程序发请求时需要写全路径。

小程序的发请求的服务器必须去官网设置，因为我们本地的localhost默认提供http协议，而非https，所以不满足小程序的服务器协议要求，我们只需在开发者工具中设置不校验合法协议即可。

在index组件的index.js中发送请求获取轮播图数据

~~~js
onLoad(options) {
    wx.request({
        url: 'http://localhost:3000/banner',
        data: {type: 2},
        success(res) {
            console.log('请求成功：', res);
        },
        fail(err) {
            console.log("请求失败：", err);
        }
    })
},
~~~

# fifth commit

## 1.封装wx.request

创建utils（utility：实用工具）文件夹，在request.js中封装`wx.request`请求。

~~~js
export default (url, data = {}, method = 'GET') => {
    wx.request({
        url,
        data,
        method,
        success(res) {
            console.log('请求成功：', res);
        },
        fail(err) {
            console.log("请求失败：", err);
        }
    })
}
~~~

想拿到请求结果，如果在封装的函数体中`return`会拿到undefined，因为`wx.request`是异步代码。**错误示例**如下：

~~~js
export default (url, data = {}, method = 'GET') => {
    let result;
    wx.request({
        url,
        data,
        method,
        success(res) {
            console.log('请求成功：', res);
            result = res;
        },
        fail(err) {
            console.log("请求失败：", err);
            result = err;
        }
    })
    return result;
}
~~~

解决方案：要想获得异步代码的结果，我们可以用`async`函数的`await`，所以我们在封装请求函数时把`wx.request`放在promise的执行器中，并把请求到的数据作为promise成功或失败的理由，这样便可以用`await`在组件中获取到请求的结果。

~~~js
export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve,reject)=>{
        wx.request({
            url,
            data,
            method,
            success(res) {
                console.log('请求成功：', res);
                resolve(res.data);
            },
            fail(err) {
                console.log("请求失败：", err);
                reject(err);
            }
        })
    })
}
//组件中：
async onLoad(options) {
    let result = await request('http://localhost:3000/banner', {type: 2});
    console.log('结果数据：',result);
},
~~~

为了继续解耦（提取发请求服务器信息）：创建/utils/config.js:

~~~js
//配置服务器相关信息
export default {
    host: 'http://localhost:3000'
}
~~~

修改请求函数：

~~~js
import config from './config';
export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve,reject)=>{
        wx.request({
            url: config.host + url;
            data,
            method,
            success(res) {
                console.log('请求成功：', res);
                resolve(res.data);
            },
            fail(err) {
                console.log("请求失败：", err);
                reject(err);
            }
        })
    })
}
//组件中：
async onLoad(options) {
    let result = await request('/banner', {type: 2});
    console.log('结果数据：',result);
},
~~~

# sixth commit

## 1.轮播图列表渲染

`wx:for="{{}}"`：{{}}插值语法里直接访问需要遍历的对象（数组）,默认遍历的项为`item`，下标为`index`

~~~html
<swiper-item wx:for="{{banners}}" wx:key="bannerId">
    <image src="{{item.pic}}"></image>
</swiper-item>
~~~

`wx:key`自动访问item中的属性，无需用插值语法

# seventh commit

## 1.推荐歌曲部分动态渲染--列表渲染自定义遍历项的名称

考虑到避免嵌套情况的`wx:for`遍历项都是`item`，可以使用`wx:for-item`指定遍历项的名称

~~~html
<scroll-view class="recommendScroll" enable-flex scroll-x>
    <view class="scrollItem" wx:for="{{recommendList}}" wx:key="id" wx:for-item="recommendItem">
        <image src="{{recommendItem.picUrl}}" />
        <text>{{recommendItem.name}}</text>
    </view>
</scroll-view>
~~~

# eighth commit

## 1.提取推荐歌曲和排行榜的头部部分为全局组件

1. 创建组件：/components/NavHeader，提取结构与样式

2. 页面的json文件中注册组件：

   ~~~js
   {
     "usingComponents": {
       "NavHeader": "/components/NavHeader/NavHeader"
     }
   }
   ~~~

3. 页面中使用组件并选择性传递props数据，组件中使用properties配置项接收，组件结构中使用插值语法使用properties接受的数据即可。

   `<NavHeader title="排行榜" nav="热歌风向标"></NavHeader>`

   ~~~js
   properties: {
       title: {
           type:String,
           value: "title默认值"
       },
       nav: {
           type:String,
           value: "nav默认值"
       }
   },
   ~~~

## 2.bug修复：scroll-view需要手动指定高度，否则即使设置了横向排列还是会按竖向排列计算高度（高度过高）

# ninth commit

## 1.排行榜部分静态搭建

排行榜部分选择swiper而非scroll-view因为轮播图是逐帧滑动的，而滑窗不被限制滑动幅度，排行榜部分需要逐帧滑动。

用到了swiper的一些配置属性：

`<swiper class="topListSwiper" circular="true" next-margin="50rpx" previous-margin="50rpx">`

* circular：循环轮播
* next-margin：看见下一个swiper-item的一部分
* previous-margin：看见上一个swiper-item的一部分

# tenth commit

## 1.排行榜部分动态展示

## 2.防止音乐名字过长出现挤压同级的元素（图片），用到css属性`max-width`

## 3.请求排行榜数据需要五次请求，把更新数据放在for循环的内部，这样不用等到全部请求完毕再呈现页面，防止白屏时间过长。

# eleventh commit

真机调试请求失败问题

解决方案：项目请求的地址修改为真实的ipv4地址，而不用localhost，然后手机连接局域网。

解决方案2：使用内网穿透工具uTools

# twelfth commit

1.tabBar（页面切换导航栏）的使用：

在app.json中配置tabBar：

* color：底部字体颜色---必选配置
* selectedColor：选中后字体颜色---必选配置
* backgroundColor：导航栏背景颜色---必选配置
* list：2-5个导航选项---必选配置

~~~js
"tabBar": {
  "color": "#333", 
  "selectedColor": "#d43c33",
  "backgroundColor": "#fff",
  "list": [ 
    {
      "pagePath": "pages/index/index",
      "text": "主页",
      "iconPath": "/static/images/tabs/tab-home.png",
      "selectedIconPath": "/static/images/tabs/tab-home-current.png"
    },
    {
      "pagePath": "pages/video/video",
      "text": "视频",
      "iconPath": "/static/images/tabs/select.png",
      "selectedIconPath": "/static/images/tabs/selected.png"
    },
    {
      "pagePath": "pages/personal/personal",
      "text": "个人中心",
      "iconPath": "/static/images/tabs/tab-my.png",
      "selectedIconPath": "/static/images/tabs/tab-my-current.png"
    }
  ]
}
~~~

# thirteenth commit

个人中心页静态页面搭建

# fourteenth commit

## 1.给个人中心页下半部分添加拖动下滑动画效果

我们让个人中心下半部分页面可以向下拖动一小段距离，并且会慢慢回弹

首先监听个人中心下半部分结构的手指操作事件：

* `bindtouchstart`：手指接触事件
* `bindtouchmove`：手指接触移动事件
* `bindtouchend`：手指离开事件

我们想用移动事件得到的手指位置与接触事件获得的手指位置做差来计算手指移动的距离，然后用transform属性配合移动距离控制元素位置，并在回弹时添加过渡效果：

~~~html
<view 
    class="cover-container"
    bindtouchstart="handleTouchStart"
    bindtouchmove="handleTouchMove"
    bindtouchend="handleTouchEnd"
    style="transform:{{coverTransform}}; transition:{{coverTransition}}"
>
~~~

但这里存在`bindtouchstart`和`bindtouchmove`的回调函数位于pages配置对象的同一级的情况（两者获得的位置数据无法互相访问），所以在personal.js中定义与pages同级的变量作为计算用的中间变量，目的是**让它们作为全局变量让pages中的不同回调函数共同访问，配合计算。**

~~~js
let startY = 0;//手指起始坐标
let moveY = 0;//手指移动过程中的坐标
let moveDistance = 0;//手指移动的距离
pages({...
})
~~~

监听回调函数需要借助`event`事件对象，里面的`touches`手指数组存放所有的手指触碰信息，`touches[0]`就是第一个手指，手指的`clientY`属性代表手指距离屏幕最上方的位置。

~~~js
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
~~~

# fifiteenth commit

1.创建登录页面--login，并配置顶部标题为“登录”。

login.json：（全局配置app.json中"navigationBarTitleText"配置项属于"windows"对象）

~~~js
{
  "navigationBarTitleText": "登录"
}
~~~

2.登录页面静态页面的搭建

# sixteenth commit

## 知识点

### 登录功能流程

1. 收集表单数据
2. 前端验证
   1. 验证用户信息（账号，密码）是否合法
   2. 前端验证如果不通过就提示用户，不需要发请求给后端
   3. 前端验证通过了，发请求（携带账号、密码）给服务器端
3. 后端验证
   1. 验证用户是否存在
   2. 用户不存在直接返回，告诉前端用户不存在
   3. 用户存在再验证密码是否正确
   4. 密码不正确返回给前端提示密码不正确
   5. 密码正确返回给前端数据（携带用户相关信息），提示用户登陆成功



### 事件回调函数的event事件对象有两个属性

* target
* currentTarget

他们的区别在于：event.target是指真正触发事件的那个元素，而event.currentTarget是指绑定了回调函数的那个元素，也就是说在事件委托时，我们需要用event.target去访问真正触发事件的元素，而event.currentTarget只能访问到设置回调函数的事件委托给的父元素。



### 事件委托

1. 什么是事件委托
   1. 将子元素的事件委托给父元素
2. 事件委托的好处
   1. 减少绑定的次数
   2. 后期新添加的元素也可以享用到之前委托的事件
3. 事件委托的原理
   1. 事件冒泡：子元素触发事件，冒泡冒到父元素上
4. 如何找到是哪一个子元素触发了事件
   1. event.target



### 对象内部用变量代替key值&&对象外部用变量代替key

~~~js
let params = "objKey";
let obj = {
    [params]:"objValue",//对象内部用变量代替key值
}
console.log(obj);//{"objKey":"objValue"}
console.log(obj[params]);//objValue---对象外部用变量代替key
~~~



### 组件的`id`属性于`data-key`属性区别：

都是用来给元素添加标识的，但是一个元素id属性只有一个，通过event.target.id访问；我们可以通过data-key给元素添加多个自定义属性，通过event.target.dataset来访问自定义属性对象（属性集合）



## 本次提交完成内容

### 1.完成表单数据的收集

配置data：

~~~js
data: {
  phone: '',//手机号
  password: ''//密码
},
~~~

给两个input绑定相同的bindinput的回调函数，用一个回调函数处理phone和password的修改（当然也可以绑定两个不同的回调函数，分别修改data中的phone和password）

~~~html
<view class="input-item">
    <text class="tit">手机号码</text>
    <input  type="text" placeholder="请输入手机号码" id="phone" bindinput="handleInput"/>
</view>
<view class="input-item">
    <text class="tit">密码</text>
    <input type="password"  placeholder="请输入密码" id="password" bindinput="handleInput"/>
</view>
~~~

回调函数可以通过`event.detail.value`访问表单的新数据，目前的问题就是如何区别是哪一个表单数据发生改变：我们给手机号和密码对应的input设置`id`属性，给手机号input设置id=”phone“，密码input设置id=”password“（与data中的key相同），这样我们就可以在回调函数中通过`event.currentTarget.id`区别是哪一个input触发了输入事件，然后直接用**对象内部用变量代替key值**的语法修改data中的数据即可

~~~js
handleInput(event) {
    let type = event.currentTarget.id;//这里不牵扯事件委派，完全等价于用event.target
    this.setData({
        //id值于data中的key值相同，直接通过id值修改data对象
        [type]:event.detail.value,
    })
}
~~~

这样就实现了对表单数据的收集，我们除了利用id这个属性来区别哪一个input之外，还可以用自定义属性`data-key=value`，比如给input添加属性：`data-type="phone"`，那么可以通过`event.currentTarget.dataset.type`访问到”phone“

# seventeenth commit

## 1.前端验证

手机号验证

1. 内容为空
2. 手机号格式不正确：第一位“1”，第二位“3”-“9”，剩下9位任意数字
3. 手机号格式正确

提示信息用`wx.showToast({title:'要提示的文本',...})`。(微信环境下的wx.showToast类似于浏览器环境下的window.alert)

首先给登录按钮绑定点击事件--->bindtap：`<button class="confirm-btn" bindtap="login">登录</button>`

~~~js
login() {
  let {phone, password} = this.data;
  if(!phone) {//如果手机号为空
    wx.showToast({
      title: '手机号不能为空',
      icon: 'none'
    })
    return;
  }
  let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;
  if(!phoneReg.test(phone)) {
    wx.showToast({
      title: '手机号格式错误',
      icon: 'none',
    });
    return;
  }
  //密码只判断不为空
  if(!password) {
    wx.showToast({
      title: '密码不能为空',
      icon: 'none',
    });
    return;
  }
},
~~~

## 2.后端验证

~~~js
//后端验证部分

//发送请求，获取用户信息
let result = await request('/login/cellphone', {phone, password});
//反馈登陆情况
if(result.code === 200) {
  wx.showToast({
    title: '登陆成功',
  })
}else if(result.code === 400) {
  wx.showToast({
    title: '手机号错误',
    icon: 'none',
  })
}else if(result.code === 502) {
  wx.showToast({
    title: '密码错误',
    icon: 'none'
  })
}else {
  wx.showToast({
    title: '登陆失败，请重新登录',
    icon: 'none',
  })
}
~~~

## 3.排行榜部分请求逻辑更新

原因：后端验证需要最新的网易云接口项目，以前用的项目后端验证功能已经失效，但是最新的接口服务器项目清除了单独的排行榜接口，官方解释：排行榜也是歌单的一种，所以我们不能直接去请求排行榜了，我们需要先获取排行榜作为一个歌单的歌单id，再利用id去查询排行榜的详细信息。

~~~js
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
~~~

## 4.服务器接口文档地址：[网易云音乐 NodeJS 版 API (binaryify.github.io)](https://binaryify.github.io/NeteaseCloudMusicApi/#/)

## 5.服务器项目地址：[GitHub - Binaryify/NeteaseCloudMusicApi: 网易云音乐 Node.js API service](https://github.com/Binaryify/NeteaseCloudMusicApi)

# eighteenth commit

## 1.利用本地存储，完成个人中心页与登录页面的跳转交互：未登录时点击个人中心页的上半部分转调至登陆页面，登录成功时转跳回个人中心页并呈现用户头像以及昵称等信息。

* 未登录时点击个人中心页上方转跳至登录页面：

`bindtap`回调函数`toLogin`中，借助`wx.navigateTo`：

~~~js
wx.navigateTo({
  url: '/pages/login/login'
})
~~~

* 登陆成功跳转回个人中心页面

后端验证通过后，借助`wx.switchTab`（因为`wx.navigateTo`不能跳转至tabBar页面）

~~~js
let result = await request('/login/cellphone', {phone, password});
if(result.code === 200) {
  wx.showToast({
    title: '登陆成功',
  })
  //页面跳转
  wx.switchTab({
      url: '/pages/personal/personal'
  })
    
}
~~~

* 利用本地存储让个人中心页拿到登录页面请求获得的用户信息

`wx.setStorageSync(string key, any data)`

~~~js
//后端验证通过之后，在页面跳转之前，把用户信息存储至本地
...
wx.setStoragesSync('userInfo', JSON.stringify(result.profile))

wx.switchTab({
    url: '/pages/personal/personal'
})
~~~

然后在personal页面的onload中获取本地存储的用户信息

但这样即使在onload中获取了数据，并且修改了data中的数据，页面也不会渲染，因为个人中心页面从未登录时到现在登陆成功，一直没有销毁，所以onload不会再次执行，所以我们在登陆成功转跳回personal页面时，我们不用`wx.switchTab`，我们用`wx.reLaunch`（关闭所有页面，然后跳转到指定页面）

~~~js
onLoad(options) {
  let userInfo = wx.getStorageSync('userInfo');
  if(userInfo) {
    this.setData({
      userInfo: JSON.parse(userInfo),
    })
  }
},
~~~

不把获取数据的逻辑放在onShow中，为了防止多次执行，优化性能。

# ninteenth commit

## 1.完成个人中心页面最近播放记录的动态展示

* 结构选用`<scroll-view>`

* 获取服务器数据：

  * 我们在onLoad中发请求获取服务器数据，但是为了避免给onLoad使用async关键字，我们先封装一个方法，在onLoad中进行调用

    ~~~js
    async getUserRecentPlayList(userId) {
      let recentPlayListData = await request('/user/record',{uid: userId, type: 0});
      //因为最近播放数据的数据项没有唯一标识的id属性，所以可以用map方法人为添加id属性，给wx:key使用
      //截取最近播放数据数组之后用map方法进行加工再使用
      let index = 0;
      let recentPlayList = recentPlayListData.allData.splice(0,10).map(item => {
        item.id = index++;
        return item;
      })
      this.setData({
        recentPlayList,
      })
    },
    ~~~

    ~~~js
    onLoad(options) {
      let userInfo = wx.getStorageSync('userInfo');
      if(userInfo) {
        this.setData({
          userInfo: JSON.parse(userInfo),
        })
        //获取用户播放记录
        this.getUserRecentPlayList(this.data.userInfo.userId);
      }
    },
    ~~~


# twentieth commit

1.个人中心页完善：考虑用户没有播放记录的情况

~~~html
<scroll-view wx:if="{{recentPlayList.length}}">
    ...
</scroll-view>
<view vx:else>暂无播放记录</view>
~~~

# twenty-first commit

## 知识点

### `flex：1`实现三栏布局中间宽度自适应（双飞翼和圣杯的新方案）

父元素是flex元素，子元素有三个属性

* `flex-grow`
* `flex-shrink`
* `flex-basis`

#### flex-grow

概念：默认值是0，代表主轴上即使存在多余空间，也不会放大

* 所有项目的`flex-grow` 为 1：等分剩余空间（自动放大占位）
* `flex-grow` 为 n 的项目，占据的空间（放大的比例）是 `flex-grow` 为 1 的 n 倍。

#### flex-shrink

概念：默认值为1，所有项目默认值都为1，代表主轴空间如果不足，所有项目将等比例缩小

* `flex-shrink`为0，代表这个项目不会缩小
* `flex-shrink`为n的项目，空间不足时缩小的比例是`flex-shrink`为1的项目的n倍

#### flex-basis

概念：默认值为auto，代表这个项目大小不变，原本该多大就多大，前面的flex-shrink和flex-grow都涉及一个概念----主轴空间，flex-basis值为百分比，代表这个项目在主轴上的大小是flex容器的百分之多少，比如flex容器宽度1000px，某个项目flex-basis值为10%，那么这个项目宽度就是100px，而且通过flex-basis设置的大小优先级高于width的优先级。

* `flex-basis`为百分比，代表这个项目主轴上的大小为flex容器的百分之多少
* `flex-basis`为具体px，代表这个项目主轴上就是多大

#### flex

`flex`属性是`flex-grow`, `flex-shrink` 和 `flex-basis`的简写，默认值分别为`0 1 auto`

##### flex写法

* flex：n；

  ~~~css
  flex ：n；
  /* 等同于: */
  flex-grow ：n；
  flex-shrink ：1；
  flex-basis ：0%；
  ~~~

* flex：n1 n2；

  ~~~css
  flex ：n1 n2;
  /* 等同于: */
  flex-grow ：n1；
  flex-shrink ：n2；
  flex-basis ：0%；
  ~~~

* flex：长度 or 百分比；

  ~~~css
  flex : L;
  /* 等同于: */
  flex-grow ：1；
  flex-shrink ：1；
  flex-basis ：L；
  ~~~

* flex：n L

  ~~~css
  flex ：n L；
  /* 等同于: */
  flex-grow：n；
  flex-shrink：1；
  flex-basis：L;
  ~~~

总结：**`flex-grow` 和 `flex-shrink` 在 `flex` 属性中不规定值则为 1，`flex-basis` 为 0%。**（所以flex：auto即为flex：1 1 auto）

**所以，flex：1即为flex-grow：1，flex-shrink：1，flex-basis：0%**，使用flex：1实现两端固定，中间自适应的原理就是中间的项目flex-grow：1，其它项目flex-grow的值都为0，这样相当于如果主轴有空间没占满，就直接全部分给中间的项目，**flex-basis为0%，但是不影响，其实顺序是每个项目不管通过width还是flex-basis先获得了自己的一个大小之后，即使这时候flex-basis让我们一点大小没分到，但是在根据主轴的剩余空间平分主轴空间的时候，它分得了所有主轴剩余的空间**（如果屏幕变小，flex-shrink的默认值所有项目都为1，三个部分都等比例缩小）

~~~html
<div class="container">
	<div class="item1"></div>
	<div class="item2"></div>
	<div class="item3"></div>
</div>
<style>
	.container {
        /*父元素flex*/
		display: flex;
		height: 500px;
		border:1px solid green
	}
	.item1 {
		background-color: red;
		height: 100%;
		width: 250px;
	}
	.item2 {
		background-color: black;
		height: 100%;
		width: 250px;
		flex-grow: 1;/*子元素flex-grow为1，等价于flex:1，相当于后两个属性省略*/
	}
	.item3 {
		background-color: aqua;
		height: 100%;
		width: 250px;
	}
</style>
~~~

## 本次提交完成内容

完成视频页（video）的头部结构——三栏布局，中间栏自适应：父元素display：flex，两侧图片，中间部分flex：1，说白了就是flex-grow：1；

# twenty-second commit

## 1.video导航区域静态搭建

结构选用`<scroll-view>`，每一项里面就是简单的文本，但我们要给选中的导航增加一个下边框，这个边框只在文本下面有，所以`scrollItem`里面就不能直接是文本，因为这样border-bottom会包含`scrollItem`的padding部分，以至于超出文本部分，解决方案就是`scrollItem`内保再嵌套一个`<view>`给`scrollItem`添加padding，然后给最内部的`view`添加border-bottom。

~~~css
/*以下结构给navItem添加border-bottom会包括padding部分，不理想*/
<scroll-view class="navScroll" scroll-x enable-flex>
    <view class="navItem active">
        推荐
    </view>
    <view class="navItem">
        万有引力
    </view>
</scroll-view>
/*多嵌套一层view，给最内层的view添加border-bottom，这样底部边框只会包含文本部分*/
<scroll-view class="navScroll" scroll-x enable-flex>
    <view class="navItem">
        <view class="navContent active">
            推荐
        </view>
    </view>
</scroll-view>
~~~

# twenty-third commit

## 知识点

### 关于微信小程序事件回调函数传参的方法：

不像vue中的函数直接传参：`@click="fun(params)"`，微信小程序事件的回调函数不能直接传参，事件监听后面只写回调方法名：`bindtap="fun"`，传参的话用`id=paramsValue`或者`data-key=value`的形式，但js部分微信小程序的回调函数可以接收一个事件参数，利用这个事件参数`event`访问传入的参数：`event.currentTarget.dataset.key`或者`event.currentTarget.id`

## 本次提交完成内容

### 1.video导航区域数据动态展示

### 2.给选中的导航项动态添加类名（下划线效果）

用服务器数据中的id项给回调函数传参，这里传给pages实例之后id从一个数字变成了字符串，然后用这个字符串id更新data数据，在wxml中通过比较data中保存id与服务器数据id，如果相同添加class，所以我们就需要在更新data中的id时对`event.currentTarget.id`进行数据类型转换。转成数字。

~~~js
changeNav(event) {
  let navId = event.currentTarget.id;
  this.setData({
    navId: navId*1,//string转number的方法一，方法二：还可以navId: navId>>>0
    //>>>0：右移零位，相当于没有位移，但是它可以把string类型强制转化为number类型
  })
},
~~~

总结：传给标签的id属性在pages里面拿到之后会自动转化为string类型；但经过测试用data-id传给标签的参数id不会转化，保留了number类型，所以这里用`data-key=value`的方式传参不用类型转化便可以解决问题。

# twenty-fourth commit

~~1.video页面中获取选中导航下的视频数据~~

~~首先写好请求异步函数~~

~~~js
async getVideoList(navId) {
  let videoListData = await request('/video/group', {id: navId});
},
~~~

~~但这个函数不能在onLoad中与`getVideoGroupListData();`（获取视频导航的请求）同级调用，因为`getVideoList(navId)`需要的navId是通过导航请求返回的，所以为了避免`getVideoList(navId)`发出时服务器已经返回了navId相关数据，我们把`getVideoList(navId)`的调用放在`getVideoGroupListData();`的内部，在`getVideoGroupListData();`中更新了data数据之后再发送`getVideoList(navId)`~~

~~~js
async getVideoGroupListData() {
  let videoGroupListData = await request('/video/group/list');
  this.setData({
    videoGroupList: videoGroupListData.data.slice(0,14),
    navId: videoGroupListData.data[0].id,
  })
  //获取视频列表数据
  this.getVideoList(this.data.navId);
},
~~~

~~`getVideoList(navId)`请求需要用户登录的cookie值才能成功，所以我们在登录的请求成功时需要保存服务器返回的cookie信息，为了识别某个请求是登录请求，我们可以在发送登录请求的时候添加布尔类型参数isLogin，给封装的request方法中`wx.request`的成功回调中增加逻辑判断：`if(data.isLogin){wx.setStorage({key:'cookies',data: res.cookies})}`，并且在发请求时携带cookie信息：`wx.request`增加一个配置项`header:{cookie:...}`~~

~~~js
import config from './config';
export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve,reject)=>{
        wx.request({
            url: config.host + url,
            data,
            method,
            //有些请求需要cookie信息，所以增加一个请求配置项header，里面携带cookie
            //经测试，返回的cookie中我们只需要包含MUSIC_U字段的那一个cookie即可
            header: {
                cookie: wx.getStorageSync('cookie') ? wx.getStorageSync('cookie').find(item => item.indexOf('MUSIC_U') !== -1) : '',
            },
            success(res) {
                resolve(res.data);
                //如果发请求是data中有isLogin属性，就说明是登录请求，成功时就需要保存cookies信息
                if(data.isLogin) {
                    wx.setStorage({
                        key: 'cookies',
                        data: res.cookies
                    })
                }
            },
            fail(err) {
                reject(err);
            }
        })
    })
}
~~~

## 1.video页面中获取选中导航下的视频数据

**经测试，网易云音乐返回的数据结构发生改变，登录信息的cookie存放在了登录成功返回的数据的data项内部，而且`getVideoList(navId)`中向'/video/group'接口发送请求时cookie信息是作为请求普通参数携带的，而不是放在请求头中**

所以video页面获取选中导航的视频数据核心逻辑首先是

* 修改登录页面，在登录后端验证通过拿到用户信息时，把服务器返回的cookie保存至本地

  ~~~js
  let result = await request('/login/cellphone', {phone, password, isLogin:true});
  if(result.code === 200) {
    wx.showToast({
      title: '登陆成功',
    })
    wx.setStorageSync('userInfo', JSON.stringify(result.profile));
    //登陆成功将cookie信息存储至本地
    wx.setStorage({
      key: 'cookie',
      data: result.cookie
    })
    ...
  ~~~

* 获取视频数据的回调函数获取cookie参数时访问本地存储，在初始化视频导航栏时和点击切换导航栏时调用`getVideoList`函数

  ~~~js
  async getVideoList(navId) {
    let videoListData = await request('/video/group', {id: navId, cookie: wx.getStorageSync('cookie')});
    this.setData({
      videoList: videoListData,
    })
  },
  ~~~

  

# twenty-fifth commit

## 1.video页完成视频列表的静态搭建与动态展示

scroll-view标签遍历生成item时，遍历数据的数据项没有id型的唯一标识型数据项，所以我们要加工遍历数据，增加一个id项供wx：key使用**（为什么要加工数据，而不用遍历时的index？因为wx:key=“”引号中访问的数据是遍历项自身的某个属性，而访问不到wx:for提供的index）**

~~~js
async getVideoList(navId) {
  let videoListData = await request('/video/group', {id: navId, cookie: wx.getStorageSync('cookie')});
    
  //加工videoListData数据，手动增加一个id值给wx:key用（用map加工原数组）
  let index = 0;
  let videoList = videoListData.datas.map(item => {
    item.id = index++;
    return item;
  })
  
  this.setData({
    videoList
  })
},
~~~

以上为尚硅谷视频教学的实现方法，**但是发现网易云接口变动，videoList中视频的url为null**，只有视频id，需要通过'/video/url'接口获取对应视频id的视频播放地址，相当于需要我们手动发请求完善最初请求获得的videoListData数据，把null完善成真实的数据，所以修改以上函数：

~~~js
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
  this.setData({
    videoList,
  })
},
~~~

视频播放窗下方的用户与视频的相关信息利用videoList动态展示即可，暂未添加交互效果

**css制作效果：用户头像右边是用户名，两者在一条水平线上**

首先两个同级，同属于某个父级元素，用户头像是一个image标签，用户名是一个text标签，两者都是行内元素，此时它俩位于同一行，要想让他们俩在同一水平线上，我们只需给image和text都加上`vertical-align: middle;`样式即可（vertical-align是指被设置的元素位于其父元素的一行的上下某个位置）

# twenty-sixth commit

## 用户体验优化

### 1.video视频页切换导航选项时增加“正在加载”提示框，并在新数据准备就绪时清除“正在加载”提示框

* `wx.showLoading({title:'提示内容'})`：显示提示框
* `wx.hideLoading();`：清除提示框

### 2.在切换了导航，显示“正在加载“提示框时，用户依然能看见原有的视频内容，这时候因该白屏比较合适，所以在切换导航的回调中，更新data中的导航标识的同时修改videoList为空数组（清除原有的视频数据）

# twenty-seventh commit

## 1.实现视频页点击某个导航时自动滚动scroll-view，让被选中的导航项滚动到导航栏的最左端

利用<scroll-view>标签的`scroll-into-view`属性，需要先给每一个`scrollItem`设置`id`属性，`scroll-into-view`指定一个id值（这个id值绑定data中的动态值，一旦修改data中的这个值，就会有自动滑动效果），就会切换到`scroll-into-view`指定的id位置。这个切换是瞬间的，我们给<scroll-view>添加`scroll-with-animation`属性即给导航切换增加了动画过渡效果。

plus：但是`scroll-into-view`的id值不能以数字开头，所以可以给`scroll-into-view`的id和`scrollItem`的id都增加一个相同的字符串前缀。

~~~css
<scroll-view class="navScroll" scroll-x enable-flex scroll-into-view="{{'scroll' + navId}}" scroll-with-animation="{{true}}">
    <view id="{{'scroll' + item.id}}" class="navItem" wx:for="{{videoGroupList}}" wx:key="id">
        <view class="navContent {{navId === item.id ? 'active' : ''}}" bindtap="changeNav" id="{{item.id}}" data-id="{{item.id}}">
            {{item.name}}
        </view>
    </view>
</scroll-view>
~~~

# twenty-eighth commit

## 1.解决多个视频同时播放的问题，修改为同一时间只能播放同一个视频

给video添加`bindplay`事件的回调`handlePlay`

`<video src="{{item.data.urlInfo}}" bindplay="handlePlay" id="{{item.data.vid}}"></video>`

~~~js
handlePlay(event) {
  //获取被点击的视频的id
  let vid = event.currentTarget.id;
  //关闭上一个播放的视频
  this.vid !== vid && this.videoContext && this.videoContext.stop();
  /*
  这段代码等价于：
  //先判断点击的不是同一个视频：以前的视频vid和本次视频vid不相同
  if(this.vid !== vid) {
  	//如果不是第一次点击播放视频，也就是已经创建了videoContext
  	if(this.videoContext) {
  		//我们就暂停上一个视频的播放
  		this.videoContext.stop();
  	}
  }
  */
  //更新this.vid和this.videoContext为本次点击的视频的vid和videoContext
  this.vid = vid;
  this.videoContext = wx.createVideoContext(vid);
},
~~~

这里我们把vid和videoContext都创建在了页面实例上：`this.vid=vid...`，这样就做到了相同事件两次之间的信息交流（比如下一次点击视频时可以通过this.vid）访问到上一次点击时设置的vid。

plus：只用this.videoContext创建视频上下文对象，用到了一种设计模式：单例模式（需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象实例）这样可以节省内存空间。

# twenty-ninth commit

## 1.用image代替video进行性能优化（一个页面同时出现很多video的话会造成视频播放卡顿，我们设想用image代替video，只有视频被点击进行播放的时候将image转化为video）

可以用<video>的`poster`属性可以修改视频封面（不用poster指定封面的话，视频封面就是第一帧）

实现思路：

结构中写一个与<video>同级的<image>标签，我们利用`wx:if`和`wx:else`控制两者互斥展示。两者应用统一样式（保持大小一致），并且绑定同一回调函数`handlePlay`，播放或者点击时传入相同`id`参数，点击了某一个视频或者图片后，都更新data中的`videoId`，利用`wx:if`和`wx:else`控制 遍历项携带的id信息 与 `videoId` 相同的那一个图片展示为视频，而其它遍历项都展示图片。

plus：经过本次优化之后，整个视频列表只有一个<video>，而其余都是<image>，自然视频最多只有一个在播放，也就没有必要保存保证只有一个视频在播放的逻辑（上次代码）。

~~~js
handlePlay(event) {
  //获取被点击的视频的id
  let vid = event.currentTarget.id;
  //更新数据，wx:if和wx:else控制只显示videoId对应的视频，其余为图片
  this.setData({
    videoId: vid,
  })
  //让图片转化成的视频进行播放
  this.videoContext = wx.createVideoContext(vid);
  this.videoContext.play();
},
~~~

~~~css
<video 
    wx:if="{{videoId === item.data.vid}}" 
    src="{{item.data.urlInfo}}" 
    bindplay="handlePlay" 
    id="{{item.data.vid}}" 
    poster="{{item.data.coverUrl}}" 
    class="common"
></video>

<!-- 性能优化，用image代替video -->
<image 
    wx:else bindtap="handlePlay" 
    id="{{item.data.vid}}" 
    src="{{item.data.coverUrl}}" 
    class="common"
/>
~~~

# thirtieth commit

1.<video>的`object-fit`属性解决视频大小与<video>大小不一致出现黑色无动画区域的情况

`<video object-fit="cover">`

# thirty-first commit

## 知识点

### c3新特性：calc

* 可以动态计算css的宽高，**运算符两侧必须加上空格，否则计算失效**

### 视口单位： 

* vh：1vh=1%的视口高度
* vw：1vw=1%的视口宽度

## 1.实现视频页上下滑动的时候上方导航栏固定

实现原理，给<scroll-view>设置一个高度，那么滑动只会在<scroll-view>的高度范围内进行。我们的视频页，上方是导航栏，最下方是tabBar，我们只需设置<scroll-view>高度为整个页面减去导航栏高度和tabBar高度，视觉上就实现了滑动过程中导航栏的固定，其实实际上是以前很长的页面现在缩小成一个手机屏幕的大小，自然上部的导航栏不会滑走。

因为需要做机型适配，我们需要计算出<scroll-view>多高，而且都要用”适配单位“（vh、vw、rpx...）

~~~css
.videoScroll {
    margin-top: 10rpx;
    /*适配计算*/
    height: calc(100vh - 152rpx);
}
~~~

# thirty-second commit

## 1.实现记录视频播放进度的功能

data中增加配置数据：`videoUpdateTime: []`，数组里面存放对象，对象记录视频id和视频的播放时长

监听<video>的”视频时长更新事件”——bindtimeupdate和视频结束事件——bindended

视频播放过程中实时记录视频的播放进度

对应回调：

~~~js
//监听视频播放进度的回调
handleTimeUpdate(event) {
  let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
  let {videoUpdateTime} = this.data;
  //检查之前的视频播放记录里有没有关于目前播放视频的信息，如果有就更新信息，没有就添加当前视频的播放信息
  //数组的find方法适合用来查找符合条件的数组元素
  let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
  if(videoItem) {
    videoItem.currentTime = event.detail.currentTime;
  }else {
    videoUpdateTime.push(videoTimeObj);
  }
  this.setData({
    videoUpdateTime
  })
},

//视频播放结束，移出播放时长的记录
handleEnded(event) {
  let {videoUpdateTime} = this.data;
  videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1);
  this,setData({
    videoUpdateTime,
  })
},
~~~

以及在视频播放回调中读取视频的播放进度：

~~~js
//读取视频的播放进度
let {videoUpdateTime} = this.data;
let videoItem = videoUpdateTime.find(item => item.vid === vid);
if(videoItem) {
  this.videoContext.seek(videoItem.currentTime);
}
~~~



**此功能在pc端运行正常，但真机调试会造成视频播放卡顿**，所以在项目中暂时注释掉。

# thirty-third commit

1.视频页给<scroll-view>增加下拉刷新和上拉加载功能

* `bindrefresherrefresh`下拉刷新对应事件

* `bindscrolltolower`上拉触底对应事件

除了<scroll-view>的两个事件，页面长度大于手机屏幕时（有滚动条时），整个页面也是有下拉刷新和上拉触底对应事件的。

~~~js
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
~~~

# thirty-fouth commit

<button>设置属性`open-type="share"`便可增加点击分享功能，视频右下的省略按钮便是`<button open-type="share">`

# thirty-fifth commit

## 1.新建recommendSong页面结构

## 2.完成recommendSong页面头部区域的静态搭建

~~~html
<view class="header">
    <image src="/static/images/recommendSong/recommendSong.jpg"/>
    <view class="date">
        <text class="day">  17 / </text>
        <text class="month"> 10</text>
    </view>
</view>
~~~

使<view class="date">位于<image src="/static/images/recommendSong/recommendSong.jpg"/>中心位置（水平垂直居中）：

~~~css
.recommendSongContainer .header {
    width: 100%;
    height: 300rpx;
    /*父元素相对定位，子绝父相*/
    position: relative;
}

.recommendSongContainer .header image {
    width: 100%;
    height: 100%;
}

.recommendSongContainer .header .date {
    /*绝对定位:左和上各百分之五十，此时date的左上角处于父元素的中心，需要再把data向左向上各移动自身百分之五十的距离*/
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-45%, -40%);/*由于图片不是上下左右对称，所以不是-50%，-50%*/
    /*行内文字水平垂直居中*/
    height: 100rpx;
    text-align: center;
    line-height: 100rpx;
    
    
	width: 300rpx;
    color: #fff;
}
~~~



# thirty-sixth commit

## 1.应用小程序内置日期动态显示recommendSong页面日期

~~~js
onLoad(options) {
  this.setData({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
  })
},
~~~

# thirty-seventh commit

## 1.recommend页面内容区覆盖效果的实现（内容区域压着上面的图片）

内容区（包括头部导航以及下面歌曲列白在内的父容器）设置相对定位并向上提一下，配合白色背景颜色加圆角实现

~~~css
.ListContainer {
    /*相对定位，top为-20rpx向上提一下*/
    position: relative;
    top: -20rpx;
    /*给整个父容器添加左右内边距，让内容不紧靠手机屏幕边缘，美观*/
    padding: 0 20rpx;
    /*圆角加白色背景颜色，产生覆盖上面的图片的效果*/
    border-radius: 30rpx;
    background: #fff;
}
~~~

## 2.内容区顶部导航区，实现左右两文本，只需要右边元素右浮动即可

~~~html
<!-- 导航区域 -->
<view class="listHeader">
    <text>播放全部</text>
    <text class="changeMore">多选</text>
</view>
~~~

~~~css
.listHeader {
    height: 80rpx;
    line-height: 80rpx;
}

.listHeader .changeMore {
    float: right;
}
~~~

## 3.歌曲列表区域

主要结构是<scroll-view>，设置其高度：`height: calc(100vh - 380rpx);`，保证滑动时头部图片和导航栏固定。以下主要实现内部`scrollItem`的结构

结构分析：

​	一个`scrollItem`一行，为一个歌曲的信息，共分为三列

* 第一列，一个图片（一行都以此图片的高度为标准）
* 第二列，歌曲信息，在图片的右边，上下两行文本分别为歌名和歌手，两行平分高度
* 第三列，一个iconfont图标，位于最右侧

实现：

​	结构：

~~~html
<scroll-view scroll-y class="listScroll">
    <view class="scrollItem">
        <!-- 第一列 -->
        <image src="/static/images/nvshen.jpg"/>
        <!-- 第二列 -->
        <view class="musicInfo">
            <text class="musicName">光辉岁月</text>
            <text class="author">beyond</text>
        </view>
        <!-- 第三列 -->
        <text class="iconfont icon-gengduo-shuxiang"></text>
    </view>
</scroll-view>
~~~

`scrollItem`设置flex布局，三列位于一行，第二列的文本上下两行，所以第二列也设置flex布局：`display: flex; flex-direction: column;`第二列的文本设置为图片高度的一半（这一行都以左边图片的高度为标准），并设置文字垂直居中即可

~~~css
.musicInfo text {
    height: 40rpx;
    line-height: 40rpx;
    font-size: 24rpx;
    /*歌名和歌手设置单行文本溢出*/
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
~~~

第三列：首先通过绝对定位移动到最右边：`  position: absolute;  right: 0;`，并设置垂直居中： `height: 80rpx; line-height: 80rpx;`，因为本身是一个iconfont图标，比较小，为了优化用户体验便于点击，为其设置宽高（其父元素`scrollItem`为flex布局之后，所有子元素都获得块元素的性质---可以设置宽高，并且位于一行或者一列），但是因为iconfont设置了宽度，图标可能离右边远了，我们可以设置：`text-align: right;`来使其向右移动（而不是常用的`text-align: center;`）

~~~css
.scrollItem .iconfont {
    position: absolute;
    right: 0;
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: right;
}
~~~

# thirty-eighth commit

1.动态展示recommendSong页面数据

# thirty-ninth commit

## 1.搭建songDetail歌曲详情页静态页面

竖向排列结构：顶部是歌曲名字，紧跟一个圆形<view>，为了覆盖下面摇杆图片的缺损，接着是摇杆图片，再下面是一个空心圆形磁盘图。

~~~html
<view class="songDetailContainer">
    <!-- 歌曲名 -->
    <view class="author">beyond</view>
    <!-- 圆形底座 -->
    <view class="circle"></view>
    <!-- 摇杆 -->
    <image class="needle" src="/static/images/song/needle.png"/>
    <!-- 磁盘 -->
    <view class="discContainer">
        <image class="disc" src="/static/images/song/disc.png"/>
    </view>
</view>
~~~

磁盘和摇杆经过相对定位（`position:relative;top:-...rpx`）向上调整位置之后，摇杆顶部和底座接触，磁盘顶部和摇杆接触。但上下位置不对，应该是底座压住摇杆，摇杆压住磁盘。**这时通过`z-index`属性（需要先定位）便可以控制元素的高度（谁压住谁）**

* 底座：`z-index: 100;`

* 摇杆：`z-index: 99;`
* 磁盘：没设置z-index，默认在设置了z-index的元素下面

最后在<view class="discContainer">的内部添加一张歌曲图片（与磁盘图片同级），用定位实现歌曲图片在磁盘图片的中心（同一父元素下的两个同级元素，一个元素位于另一个元素的水平垂直居中位置），其实说白了就是让某个元素在父元素中水平垂直居中，至于有没有同级的第一个元素无所谓，只是说第一个元素本身就在父元素中居中了。

~~~html
<view class="discContainer">
    <image class="disc" src="/static/images/song/disc.png"/>
    <image class="musicImg" src="/static/images/nvshen.jpg"/>
</view>
~~~

~~~css
.musicImg {
    /* 位于父元素的水平垂直居中位置方法一： */
    /*
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    */
    /* 位于父元素的水平垂直居中位置方法二： */
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    
    width: 370rpx;
    height: 370rpx;
    border-radius: 50%;
}
~~~

