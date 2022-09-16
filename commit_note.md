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

