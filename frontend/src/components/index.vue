<template>
  <el-container>
    <el-header class='header' height='64'>
      <el-row class="headerrow">
        <el-col class="headercol" :span="18" :offset="1">
          <h1 class="headertitlle">loraserver mqtt test console</h1>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-main>
        <div class="content">
          <div>
            <div class="hr-div"></div>

            <div v-if="true" class="main-table">
              <div class="table-head" style="text-align: left;">
                <el-row class="table-title-row">
                  <el-col class="table-title-col" :span="6">
                    <span>Live mqtt message  </span>
                  </el-col>
                  <el-col :span="14">
                    <!--<el-button type='success' class="tip-button" size="mini">subscribing...-->
                    <!--</el-button>-->
                  </el-col>
                  <el-col :span="4">
                    <el-button class="create-button" size="mini" @click="clearLog">
                      <i class="el-icon-refresh"></i> CLEAR
                    </el-button>
                  </el-col>
                </el-row>
              </div>

              <div class="row-div">
                <el-table
                  :data="tableData"
                  style="width: 95%"
                  class="log-table"
                  height="300px">
                  <el-table-column
                    align="center"
                    prop="time"
                    label="时间"
                    width="110">
                    <template slot-scope="scope">
                      <span>{{scope.row.time|timeFilter}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="data"
                    label="数据"
                    width="180">
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="frequency"
                    label="频率"
                    width="80">
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="fPort"
                    label="fPort"
                    width="80">
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="rssi"
                    label="RSSI"
                    width="80">
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="gateway"
                    label="网关"
                    width="180">
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="fCnt"
                    label="fCnt">
                  </el-table-column>

                </el-table>
              </div>

            </div>
          </div>
          <div v-if="true" class="main-table" style="margin-top: 20px">
            <el-row class="panel-row">
              <el-col :span="14">
                <el-input :disabled="isMqttConnect" size="mini" v-model="host"
                          placeholder="username:password@example.com:1883">
                  <template slot="prepend">
                    {{protocol}}
                  </template>
                </el-input>
              </el-col>
              <el-col :span="6">
                <el-button v-if="!isMqttConnect" size="mini" :loading="isConnecting" class="panel-button"
                           @click="connectMqtt">
                  connect
                </el-button>
                <el-button v-if="isMqttConnect" size="mini" type="success" class="panel-button" @click="disConnectMqtt">
                  connected
                </el-button>
              </el-col>
            </el-row>
            <el-row class="panel-row">
              <el-col :span="14">
                <el-tooltip content="mqtt连接的topic，注意loraserver版本或者设置的不同，该主题可能不同，application/xx/node[device]/xxxx/tx"
                            placement="top">
                  <el-input size="mini" :disabled="isSubing" v-model="topic"
                            placeholder="application/{appID}/node[device]/{devEUI}/rx">
                    <template slot="prepend">topic for rx</template>
                  </el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="4">
                <el-button v-if="!isSubing" size="mini" class="panel-button" @click="subscribeTopic">
                  start record
                </el-button>
                <el-button v-if="isSubing" size="mini" type="success" :loading="true" class="panel-button">
                  recording...
                </el-button>

              </el-col>
              <el-col :span="6">
                <el-button v-if="isSubing" size="mini" type="danger" class="panel-button" @click="unSubscribeTopic">
                  stop
                </el-button>
              </el-col>
            </el-row>
            <el-row class="panel-row">
              <el-col :span="4">
                <el-tooltip content="注意：统计功能需要一个上行消息进行初始化" placement="top">
                  <el-button size="mini" type="info">
                    起始fcnt:{{fcnt_start}}
                  </el-button>
                </el-tooltip>
              </el-col>
              <el-col :span="4">
                <el-button size="mini" type="info">
                  消息计数:{{msg_count}}
                </el-button>
              </el-col>
              <el-col :span="4">
                <el-button size="mini" type="info">
                  当前fcnt:{{fcnt_now}}
                </el-button>
              </el-col>
              <el-col :span="4">
                <el-button size="mini" type="info">
                  累计时间:{{time_count}}s
                </el-button>
              </el-col>
              <el-col :span="4">
                <el-button size="mini" type="warning">
                  包偏差:{{fcnt_now-fcnt_start - msg_count}}
                </el-button>
              </el-col>
              <el-col :span="4">
                <el-button size="mini" type="warning">
                  丢包率:{{loss_rate}}
                </el-button>
              </el-col>
            </el-row>

          </div>
          <div v-if="true" class="main-table" style="margin-top: 20px">
            <el-row class="panel-row">
              <el-col :span="14">
                <el-tooltip content="类同接收的topic，后缀为tx，application/xx/node[device]/xxxx/tx" placement="top">
                  <el-input size="mini" :disabled="isSending" v-model="topic_tx"
                            placeholder="application/{appID}/node[device]/{devEUI}/tx">
                    <template slot="prepend">topic for tx</template>
                  </el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="3">
                <el-button size="mini" type="primary" :loading="isSending" class="panel-button" @click="sendMessage">
                  {{send_button_text}}
                </el-button>
              </el-col>
              <el-col :span="3">
                <el-button v-if="isSending&&isRepeat" size="mini" type="danger" class="panel-button" @click="stopSendMessage">
                  stop
                </el-button>

              </el-col>
            </el-row>
            <el-form :inline="true" style="padding-left: 20px">
              <el-form-item label="type:">
                <el-tooltip content="loraWAN传输消息的类型，是否为confirmed" placement="top">
                  <el-checkbox v-model="isConfirmed">confirmed</el-checkbox>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="fPort:">
                <el-tooltip content="loraWAN传输消息的端口，为2～223的一个任意数" placement="top">
                  <el-input size="mini" style="width:80px" v-model.number="fPort" placeholder="2~223"></el-input>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="data:">
                <el-tooltip content="数据以小写16进制形式输入空格隔开，例如:ff 1a 4e" placement="top">
                  <el-input size="mini" placeholder="16进制小写 空格隔开" v-model="data_sent" style="width:400px"></el-input>
                </el-tooltip>
              </el-form-item>
            </el-form>
            <el-form :inline="true" style="padding-left: 20px">
              <el-form-item>
                <el-tooltip content="是否循环发送" placement="top">
                  <el-checkbox v-model="isRepeat">is repeat</el-checkbox>
                </el-tooltip>
              </el-form-item>
              <el-form-item v-if="isRepeat" label="delay:">
                <el-tooltip content="class A 设备建议delay大于或等于设备的最小设备上行时间间隔" placement="top">
                  <el-input size="mini" style="width:100px" v-model.number="delay" placeholder="delay ms"></el-input>
                </el-tooltip>
              </el-form-item>
            </el-form>
            <el-row class="panel-row">
              <el-col :span="4">
              <el-button size="mini" type="info" @click='sent_count = 0' >
                发送计数:{{sent_count}}
              </el-button>
              </el-col>

            </el-row>
          </div>

        </div>

      </el-main>
    </el-container>
  </el-container>

</template>

<script>
  export default {
    data() {
      return {
        form: {},
        frameList: [],
        clientList: [],
        fcnt_start: 0,
        fcnt_now: 0,
        msg_count: 0,
        time_count: 0,
        protocol: 'mqtt://',
        host: '',
        topic: '',
        topic_tx: '',
        tableData: [],
        ws: '',
        isMqttConnect: false,
        isSubing: false,
        isConnecting: false,
        interval: '',
        isInit: false,
        isRepeat: false,
        isSending: false,
        send_interval: '',
        delay: '',
        isConfirmed: false,
        data_sent: '',
        fPort: '',
        sent_count:1,

      };
    },
    computed: {
      send_button_text() {
        if (this.isSending) {
          return 'sending';
        } else {
          return 'send message';
        }
      },
      loss_rate() {
        if ((this.fcnt_now - this.fcnt_start) <= 0) {
          return "0%"
        }
        if ((this.fcnt_now - this.fcnt_start - this.msg_count) < 0) {
          return "计数出错"
        }
        return (Math.round((this.fcnt_now - this.fcnt_start - this.msg_count) / (this.fcnt_now - this.fcnt_start) * 10000) / 100.00 + "%")
      }
    },
    mounted() {
      this.connectWs();
    },
    methods: {
      connectWs() {
        let domain = window.location.host;
        let domain_name = domain.split(':')[0];
        let wsURL = 'ws://' + domain_name + ':4889';
        this.ws = new WebSocket(wsURL);
        let _this = this;
        this.ws.onopen = function () {
          console.log('ws connect to ' + wsURL)
        }
        this.ws.onmessage = function (e) {
          const data = e.data;
          const res = JSON.parse(data);
          // res come
          if (res.type === 'res') {
            _this.$message({
              message: res.message,
              type: res.msgType ? res.msgType : 'info'
            });
            if(res.msgType == 'error'){
              _this.isSending = false;
              clearInterval(_this.send_interval);
            }
            if(!_this.isRepeat){
              _this.isSending = false;
            }
            // res for connectMqtt
            if (res.referen === 'connectMqtt') {
              if (res.msgType === 'success') {
                _this.isMqttConnect = true;
                _this.isConnecting = false;
              }
              if (res.msgType === 'error') {
                _this.isConnecting = false;
                clearInterval(_this.interval);
              }

            }
            // res for dis connectMqtt
            if (res.referen === 'disConnectMqtt' && res.msgType === 'success') {
              _this.isMqttConnect = false;
            }
            // res for sub
            if (res.referen === 'sub' && res.msgType === 'success') {
              _this.isSubing = true;
              _this.fcnt_start = 0;
              _this.msg_count = 0;
              _this.fcnt_now = 0;
              _this.time_count = 0;
            }
            // res for unsub
            if (res.referen === 'unsub' && res.msgType === 'success') {
              _this.isSubing = false;
              clearInterval(_this.internal);
            }
            // res for sendMeesage
            if (res.referen === 'sendMessage' && res.msgType === 'success') {

            }
          }
          // mqtt msg come
          if (res.type === 'msg') {
            if (_this.fcnt_start === 0) {
              _this.fcnt_start = res.log.fCnt;
            }
            _this.fcnt_now = res.log.fCnt;
            if (_this.fcnt_now === _this.fcnt_start) {
              _this.msg_count = 0;
            } else {
              _this.msg_count++;
              if(!_this.isInit){
                _this.internal = setInterval(function () {
                  _this.time_count++;
                }, 1000);
                _this.isInit =true;
              }

            }
            _this.tableData.unshift(res.log)
          }
        };
        this.ws.onclose = function () {
          _this.$message.error('websocket connect fail : server error')
        }
      },
      connectMqtt() {
        if (this.host === '') {
          return this.$message.error('host is empty')
        }
        this.isConnecting = true;
        const _this = this;
        this.ws.send(JSON.stringify({
          type: 'connectMqtt',
          host: this.host
        }));
        setTimeout(function () {
          if (_this.isConnecting) {
            _this.$message.error('connect to mqtt server timeout, please check your host')
          }
          _this.isConnecting = false;
        }, 5000)
      },
      disConnectMqtt() {
        this.ws.send(JSON.stringify({
          type: 'disConnectMqtt',
          host: this.host
        }))
      },
      subscribeTopic() {
        if (!this.isMqttConnect) {
          return this.$message.error('mqtt is not connected')
        }
        this.ws.send(JSON.stringify({
          type: 'sub',
          topic: this.topic
        }))
      },
      unSubscribeTopic() {
        if (!this.isMqttConnect) {
          return this.$message.error('mqtt is not connected')
        }
        this.ws.send(JSON.stringify({
          type: 'unsub',
        }));
        clearInterval(this.internal);
        this.isInit = false;
      },
      sendMessage() {
        if (!this.isMqttConnect) {
          return this.$message.error('mqtt is not connected')
        }
        if (this.fPort === '' || typeof this.fPort !== 'number') {
          return this.$message.error('fPort error')
        }

        let _this = this;
        if(this.isRepeat){
          if(this.delay === '' || typeof this.delay !== 'number'){
            return this.$message.error('delay error')
          }
          this.send_interval = setInterval(function () {
            _this.ws.send(JSON.stringify({
              type: 'sendMessage',
              topic:_this.topic_tx,
              fPort:_this.fPort,
              confirmed:_this.isConfirmed,
              data: _this.data_sent
            }));
            _this.sent_count++;
          },_this.delay)
        }else{
          this.ws.send(JSON.stringify({
            type: 'sendMessage',
            topic:this.topic_tx,
            fPort:this.fPort,
            confirmed:this.isConfirmed,
            data: this.data_sent
          }));
          _this.sent_count++
        }
        this.isSending = true;
      },
      stopSendMessage() {
        this.isSending = false;
       clearInterval(this.send_interval);
      },
      clearLog() {
        this.tableData = [];
      }
    },
    watch: {}
  };
</script>

<style>
  .itemlist-enter-active,
  .itemlist-leave-active {
    transition: all 1s;
  }

  .itemlist-enter,
  .itemlist-leave-active {
    opacity: 0;
  }

</style>
