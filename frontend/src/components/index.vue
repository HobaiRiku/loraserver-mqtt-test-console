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
                    prop="time"
                    label="时间"
                    width="110">
                    <template slot-scope="scope">
                      <span>{{scope.row.time|timeFilter}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="data"
                    label="数据"
                    width="180">
                  </el-table-column>
                  <el-table-column
                    prop="frequency"
                    label="频率"
                    width="80">
                  </el-table-column>
                  <el-table-column
                    prop="fPort"
                    label="fPort"
                    width="80">
                  </el-table-column>
                  <el-table-column
                    prop="rssi"
                    label="RSSI"
                    width="80">
                  </el-table-column>
                  <el-table-column
                    prop="gateway"
                    label="网关"
                    width="180">
                  </el-table-column>
                  <el-table-column
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
                <el-input :disabled="isMqttConnect" size="mini" v-model="host" placeholder="username:password@example.com:1883">
                  <template slot="prepend">
                    {{protocol}}
                  </template>
                </el-input>
              </el-col>
              <el-col :span="6">
                <el-button v-if="!isMqttConnect" size="mini" :loading="isConnecting" class="panel-button" @click="connectMqtt">
                  connect
                </el-button>
                <el-button  v-if="isMqttConnect" size="mini" type="success" class="panel-button" @click="disConnectMqtt">
                  connected
                </el-button>
              </el-col>
            </el-row>
            <el-row class="panel-row">
              <el-col :span="10">
                <el-input size="mini" :disabled="isSubing" v-model="topic" placeholder="application/{appID}/node[device]/{devEUI}/rx">
                  <template slot="prepend">topic</template>
                </el-input>
              </el-col>
              <el-col :span="4">
                <el-button v-if="!isSubing" size="mini" class="panel-button" @click="subscribeTopic">
                start record
              </el-button>
                <el-button v-if="isSubing" size="mini" type="success" :loading="true" class="panel-button" >
                  recording...
                </el-button>

              </el-col>
              <el-col :span="6">
              <el-button v-if="isSubing" size="mini" type="danger"  class="panel-button" @click="unSubscribeTopic">
                stop
              </el-button>
              </el-col>
            </el-row>
            <el-row class="panel-row">
              <el-col :span="4">
                <el-button size="mini" type="info">
                  起始fcnt:{{fcnt_start}}
                </el-button>
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
        tableData: [],
        ws: '',
        isMqttConnect: false,
        isSubing: false,
        isConnecting:false,
        interval:'',
        isInit:false,

      };
    },
    computed: {
      loss_rate() {
        if ((this.fcnt_now - this.fcnt_start) <= 0) {
          return "0%"
        }
        if ((this.fcnt_now - this.fcnt_start - this.msg_count ) < 0) {
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
        console.log(domain);
        let wsURL = 'ws://'+domain;
        this.ws = new WebSocket(wsURL);
        let _this = this;
        this.ws.onmessage = function(e) {
          const data = e.data;
          const res = JSON.parse(data);
          // res come
          if (res.type === 'res') {
            _this.$message({
              message: res.message,
              type: res.msgType ? res.msgType : 'info'
            });
             // res for connectMqtt
            if (res.referen === 'connectMqtt' ) {
              if(res.msgType === 'success'){
                _this.isMqttConnect = true;
                _this.isConnecting = false;
              }
              if(res.msgType ==='error'){
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
              _this.internal = setInterval(function () {
                _this.time_count++;
              },1000)
            }
            // res for unsub
            if (res.referen === 'unsub' && res.msgType === 'success') {
              _this.isSubing = false;
              clearInterval(_this.internal);
            }
          }
          // mqtt msg come
          if (res.type === 'msg') {
            if(_this.fcnt_start===0){
              _this.fcnt_start = res.log.fCnt;
            }
            _this.fcnt_now = res.log.fCnt;
            if(_this.fcnt_now === _this.fcnt_start){
              _this.msg_count =0;
            }else{
              _this.msg_count++;
            }
            _this.tableData.unshift(res.log)
          }
        };
        this.ws.onclose = function() {
          _this.$message.error('websocket connect fail : server error')
        }
      },
      connectMqtt() {
        if(this.host === ''){
          return this.$message.error('host is empty')
        }
        this.isConnecting = true;
        const _this = this;
        this.ws.send(JSON.stringify({
          type: 'connectMqtt',
          host: this.host
        }));
        setTimeout(function () {
          if(_this.isConnecting){
          _this.$message.error('connect to mqtt server timeout, please check your host')
          }
          _this.isConnecting = false;
        },5000)
      },
      disConnectMqtt() {
        this.ws.send(JSON.stringify({
          type: 'disConnectMqtt',
          host: this.host
        }))
      },
      subscribeTopic() {
        if(!this.isMqttConnect){
         return  this.$message.error('mqtt is not connected')
        }
        this.ws.send(JSON.stringify({
          type: 'sub',
          topic: this.topic
        }))
      },
      unSubscribeTopic() {
        if(!this.isMqttConnect){
         return  this.$message.error('mqtt is not connected')
        }
        this.ws.send(JSON.stringify({
          type: 'unsub',
        }))
      },
      clearLog(){
        this.tableData=[];
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
