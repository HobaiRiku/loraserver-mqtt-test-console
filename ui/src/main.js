import Vue from 'vue'
import App from './App.vue'

import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/style.css'
import ElementUI from 'element-ui'
import {timeFilter} from './util/timeFilter'
Vue.use(router)
Vue.filter('timeFilter', timeFilter)
Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
