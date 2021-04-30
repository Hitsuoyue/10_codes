# 浏览器原理学习总结
## 1 浏览器进阶总览
### 1.1 进程和线程：
并行处理：同一时刻处理多个任务，可大大提升性能

但 线程是不能单独存在的，它由进程来启动和管理。

一个进程就是一个程序的运行实例
启动一个程序时，操作系统会为该程序创建一块内存，用来存放代码、运行中的数据和一个执行任务的主线程，这样的一个运行环境就是进程。

* 进程中的任意一个线程执行出错，都会导致整个进程的崩溃
* 线程之间共享进程中的数据
* 当一个进程关闭之后，操作系统会回收进程所占用的内存
* 进程之间的内容相互隔离

### 1.2 浏览器历史
#### 1.2.1 单进程浏览器
缺点：
* 不稳定：插件、复杂的js代码导致的渲染引擎模块崩溃都会导致整个浏览器崩溃
* 不流畅：同一时刻只能执行一个模块、页面内存泄漏
* 不安全：插件、脚本可以通过浏览器获取系统权限，引发安全问题

#### 1.2.2 早期多进程浏览器
有主进程、插件进程、渲染进程
* **安全性：** 沙箱里的运行的程序不能在硬盘上写入任何数据，也不能在敏感位置读取任何数据，chrome把插件进程和渲染进程锁在沙箱里，这样即使有恶意程序也无法突破沙箱去获取系统权限。


#### 1.2.3 目前多进程浏览器架构：
包括浏览器主进程、插件进程、渲染进程、网络进程、GPU进程

* **浏览器进程：** 主要负责界面显示、用户交互、子进程管理，同时提供存储等功能。
* **渲染进程：** 核心任务是将 HTML、CSS 和 JavaScript 转换为用户可以与之交互的网页，排版引擎 Blink 和 JavaScript 引擎 V8 都是运行在该进程中，默认情况下，Chrome 会为每个 Tab 标签创建一个渲染进程。出于安全考虑，渲染进程都是运行在沙箱模式下。
* **GPU 进程：** 其实，Chrome 刚开始发布的时候是没有 GPU 进程的。而 GPU 的使用初衷是为了实现 **3D CSS** 的效果，只是随后网页、Chrome 的 UI 界面都选择采用 GPU 来绘制，这使得 GPU 成为浏览器普遍的需求。最后，Chrome 在其多进程架构上也引入了 GPU 进程。
* **网络进程：** 主要负责页面的网络资源加载，之前是作为一个模块运行在浏览器进程里面的，直至最近才独立出来，成为一个单独的进程。
* **插件进程:** 主要是负责插件的运行，因插件易崩溃，所以需要通过插件进程来隔离，以保证插件进程崩溃不会对浏览器和页面造成影响。

**缺点：资源占用高**


## 2 浏览器数据传输
互联网中的数据是通过数据包来传输的。如果发送的数据很大，那么该数据就会被拆分为很多小数据包来传输。

### 2.1 TCP/IP
#### 2.1.1 IP：把数据包送达目的主机

计算机的地址就成为IP地址，访问任何网站实际上只是你的计算机向另外一台计算机请求信息。

#### 2.1.2 UDP：把数据包送达应用程序

UDP 中一个最重要的信息是端口号，端口号其实就是一个数字，每个想访问网络的程序都需要绑定一个端口号，通过端口号 UDP 就能把指定的数据包发送给指定的程序了。

但 UDP 的传输有两个问题：
* UPD 没有对于传输错误的数据包没有重发机制，因此不能保证数据的可靠性，但传输速度非常快，适合在线视频、互动游戏等领域场景。
* 大文件会拆分成多个小数据包来传输，他们在不同时间到达接收端，而 UDP 协议不知道如何组装这些数据包来还原成完整的文件。

**IP 通过 IP 地址信息把数据包发送给指定的电脑，而 UDP 通过端口号把数据包分发给正确的程序。**

#### 2.1.3 TCP：面向连接、可靠、基于字节流的传输层通信协议

TCP 头除了包含目标端口和本机端口号外，还提供了用于排序的序列号，据此来重排数据包。

特点：
* 对数据包丢失的情况提供重传机制
* 引入了数据包排序机制，可保证把乱序的数据包组合成一个完整的文件

**TCP 连接的完整生命周期**
* 建立连接：三次握手
* 传输数据：接收端会对每个数据包进行确认操作
* 断开连接：四次挥手

**TCP 牺牲了数据包的传输速度来保证数据传输的可靠性。**

### 2.2 HTTP 
HTTP 协议建立在 TCP 连接基础上，允许浏览器向服务器获取资源，是 Web 的基础，也是浏览器使用最广的协议。

#### 2.2.1 浏览器端发起 HTTP 请求流程

* 1.构建请求：
构建请求行，然后准备发起网络请求
* 2.查找缓存：
存在缓存资源则拦截请求，直接返回该资源的副本，若不存在缓存资源则进入网络请求过程
* 3.准备 IP 地址和端口：
请求 DNS（域名系统）返回域名对应的 IP，如果域名解析过，则浏览器会缓存解析的结果，减少一次网络请求
* 4.建立 TCP 连接：
三次握手
* 5.发送 HTTP 请求：
建立了 TCP 连接后，浏览器就可以和服务器通信了。
浏览器向服务器发送的信息包括：
**请求行：** 请求方法、请求URI、HTTP协议版本
**请求头：** 浏览器基础信息
**请求体：** 信息数据
* 6.服务端返回 HTTP 请求
服务器向浏览器返回的信息包括：
**响应行：** 协议版本、状态码
**响应头：** 服务器信息、返回数据类型、要存在客户端的 Cookie 等信息

    > 特殊情况：
    > 如果设置了重定向，返回行的状态码是 301，则页面会直接重定向到响应头中 Location 字段中返回的网址。

**响应体：** 信息数据
* 7.断开连接
四次挥手

## 3 浏览器渲染
* **1.构建 DOM 树**
将 HTML 解析为 DOM 树
* **2.生成标准化样式表**
将 CSS 解析为 styleSheets，再将其属性值标准化
* **3.合成带样式的 DOM 树**
计算出每个 DOM 节点的样式，合成出一颗带样式的 DOM 树
* **4.布局**
创建布局树，并计算每个节点的坐标位置，保存在布局树中
* **5.分层**
拥有层叠上下文属性或需要被裁减的元素会被提升为单独一个图层，浏览器的页面实际上被分成了很多图层，这些图层叠加后合成了最终的页面
* **6.生成图层绘制列表**
图层的绘制包括一定的绘制顺序和许多小的绘制指令，统一输出为绘制列表
* **7.构建 DOM 树**
渲染引擎的合成线程根据绘制列表进行栅格化，栅格化就是讲图块转换为位图，这一过程会使用 GPU 来加速，生成的位图也保存在 GPU 中。
* **8.显示**
栅格化结束后，合成线程会通知浏览器进程，浏览器进程根据收到的消息将内容显示到显示器上。

## 3 在浏览器里，从输入 URL 到页面展示，发生了什么？
![image](https://upload-images.jianshu.io/upload_images/8879462-10fd6b7986ec7a04.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

























