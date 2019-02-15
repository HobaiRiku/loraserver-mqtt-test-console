import {Server} from 'http';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as _static from 'koa-static' ;
import * as path from 'path';
import * as fs from 'fs';
import {server as WebSocketServer, request, IMessage,} from 'websocket';
import * as mqtt from 'mqtt';
import * as base64_util from './base64-util';

const app = new Koa();
const router = new Router();
// 错误捕获
app.use(async (ctx: Koa.Context, next: any) => {
  try {
    await next();
  } catch (e) {
    ctx.response.status = e.statusCode || e.status || 500;
    ctx.body = {
      message: e.message,
    };
  }
});
const staticPath = './ui/dist';
// load static file dir
app.use(_static(
  path.join(__dirname, staticPath)
));
// load page
router.get('*', function (ctx: Koa.Context) {
  const index = fs.readFileSync('./ui/dist/index.html');
  ctx.status = 200;
  ctx.body = index;
});

// 未捕获错误
app.on('error', (err: Error, ctx: Koa.Context) => {
  console.error('server error', err, ctx);
});
// 404 捕获
app.use((ctx: Koa.Context) => {
  ctx.status = 404;
  ctx.body = {message: 'Not Found'};
});
// load router
app.use(router.routes()).use(router.allowedMethods());

// start app
const server: Server = app.listen(4889);
console.log(new Date() + ' app listen 4889');
// load websocket server
let wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});
// a session with websocket
wsServer.on('request', function (request: request) {
  let mqttClient: mqtt.MqttClient;
  let topicNow: string = '';
  const connection = request.accept(request.requestedProtocols[0], request.origin);
  console.log((new Date()) + ' Connection accepted.');
  // a mqtt connect message receive
  connection.on('message', function (message: IMessage) {
    if (message.type !== 'utf8' || !message.utf8Data) {
      return;
    }
    try {
      const req = JSON.parse(message.utf8Data);
      // 请求连接mqtt
      if (req.type === 'connectMqtt') {
        if (!req.host || req.host === '') {
          throw  new Error('host is empty');
        }
        mqttClient = mqtt.connect('mqtt://' + req.host);
        mqttClient.on('error', function (error) {
          mqttClient.end();
          connection.sendUTF(JSON.stringify({
            type: 'res',
            referen: 'connectMqtt',
            msgType: 'error',
            message: error.message
          }));
        });
        mqttClient.once('connect', function () {
          connection.sendUTF(JSON.stringify({
            type: 'res',
            referen: 'connectMqtt',
            msgType: 'success',
            message: 'mqtt connect ' + req.host + ' successful'
          }));
          console.log(new Date() + ' mqttClient create ');

          // mqtt message sent
          mqttClient.on('message', function (topic: string, message: any) {
            const mqtt_log = JSON.parse(message.toString());
            let rssi;
            let mac;
            let loRaSNR;
            try {
              rssi = mqtt_log.rxInfo[0].rssi;
              loRaSNR = mqtt_log.rxInfo[0].loRaSNR;
              mac = mqtt_log.rxInfo[0].mac;
            } catch (e) {
              rssi = 'server未开启rxInfo';
              mac = 'server未开启rxInfo';
              loRaSNR = 'server未开启rxInfo';
            }
            const log = {
              time: new Date(),
              data: base64_util.CharToHex(base64_util.decode(mqtt_log.data)),
              frequency: mqtt_log.txInfo.frequency / 1000000,
              fCnt: mqtt_log.fCnt,
              fPort: mqtt_log.fPort,
              rssi: rssi,
              snr: loRaSNR,
              gateway: mac
            };
            connection.sendUTF(JSON.stringify({
              type: 'msg',
              log: log
            }));
          });
        });
      }
      // 请求订阅主题
      if (req.type === 'sub') {
        if (req.topic === '') {
          throw new Error('topic is empty');
        }
        topicNow = req.topic;
        mqttClient.subscribe(req.topic);
        connection.sendUTF(JSON.stringify({
          type: 'res',
          referen: 'sub',
          msgType: 'success',
          message: 'mqtt subscribe ' + topicNow + ' successful'
        }));
      }
      // 请求取消订阅
      if (req.type === 'unsub') {
        mqttClient.unsubscribe(topicNow);
        connection.sendUTF(JSON.stringify({
          type: 'res',
          referen: 'unsub',
          msgType: 'success',
          message: 'mqtt unsubscribe ' + topicNow + ' successful'
        }));
      }
      // 请求关闭mqtt连接
      if (req.type === 'disConnectMqtt') {
        if (mqttClient) {
          mqttClient.end();
          console.log(new Date() + ' mqttClient end for req');
        }
        return connection.sendUTF(JSON.stringify({
          type: 'res',
          referen: 'disConnectMqtt',
          msgType: 'success',
          message: 'mqtt dis connect successful'
        }));
      }
      // 请求发送数据
      if (req.type === 'sendMessage') {
        let data = '';
        if (req.data !== '') {
          data = base64_util.hexEncode(req.data);
        }
        const data_str = JSON.stringify({
          reference: randomWord(false, 7),
          fPort: req.fPort,
          confirmed: req.confirmed,
          data: data
        });
        mqttClient.publish(req.topic, data_str);
        return connection.sendUTF(JSON.stringify({
          type: 'res',
          referen: 'sendMessage',
          msgType: 'success',
          message: 'data sent:' + data_str
        }));
      }
    } catch (e) {
      const err_res = {
        type: 'res',
        message: e.message,
        msgType: 'error'
      };
      connection.sendUTF(JSON.stringify(err_res));
    }
  });
  // ws connection close
  connection.on('close', function (code: number, desc: string) {
    console.log(new Date() + ' a ws connection close because of ' + desc + ' Code:' + code);
    if (mqttClient) {
      mqttClient.end();
      return console.log(new Date() + ' mqttClient end for close');
    } else {
      return;
    }
  });
});


function randomWord(randomFlag, min, max?) {
  let str = '',
    range = min,
    arr = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
  // '-', '.', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', ':', '<', '>', '?'
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min; // 任意长度
  }
  for (let i = 0; i < range; i++) {
    let pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}
