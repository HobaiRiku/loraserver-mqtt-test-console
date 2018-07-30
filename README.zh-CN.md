# loraserver-mqtt-test-console

本项目是一个针对 [loraserver](https://www.loraserver.io/) 使用的一个简单web图形界面mqtt客户端 . 

Nodejs +Koa+ websocket-npm+vue+element.io

## 功能:

* 向一个loraserver的mqtt服务端发起连接  
* 订阅指定的rx主题并实时接收设备的mqtt消息
* 设备fCnt计数以及丢包率统计
* mqtt下行消息

## 开始:

系统必须安装有 nodejs 

```bash
npm run install-all
npm run build-ui
npm run start
```

使用浏览器打开 http://127.0.0.1:4889/

## dev:

```bash
// 开发模式运行服务端
npm run dev
// 开发模式运行vue前端
npm run dev-ui
```

## screenshot:

![](screenshot.png)

## licence:

MIT