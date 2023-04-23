import Vue from 'vue'
import App from '@/App'
import router from '@/router'
import store from '@/store'
import VueCookie from 'vue-cookie'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/scss/index.scss'
import httpRequest from '@/utils/httpRequest'
import dictUtils from '@/utils/dictUtils'
import common from '@/utils/common'
import utils from '@/utils'
import '@/utils/filter'
import validator from '@/utils/validator'
import cloneDeep from 'lodash/cloneDeep'
import lodash from 'lodash/object'
import axios from 'axios'
import moment from 'moment'
import 'font-awesome/css/font-awesome.min.css'
// import i18n from './lang' // Internationalization
import VueClipboard from 'vue-clipboard2'
import VCharts from 'v-charts'
import JeeplusGencode from 'jeeplus-gencode'
import JeeplusFlow from 'jeeplus-flowable'
import 'jeeplus-flowable/lib/jeeplus-flowable.css'
import './directive'
import FormMaking from 'jeeplus-form/dist/JpFormMaking.common'
import 'jeeplus-form/dist/JpFormMaking.css'
import VueEditor from 'vue2-editor'
import Treetable from 'jeeplus-treetable'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'
import { TcPlayer } from '@/components/video/TcPlayer-module-2.4.1'
import AMap from 'vue-amap'
import dataV from '@jiaminghi/data-view'

Vue.use(VueAwesomeSwiper)
Vue.use(VueEditor)
Vue.use(FormMaking)

Vue.use(JeeplusGencode)
Vue.use(JeeplusFlow)
VueClipboard.config.autoSetContainer = true
Vue.use(VCharts)
Vue.use(VueClipboard)
Vue.use(VueCookie)
Vue.use(ElementUI)
Vue.use(Treetable)
Vue.use(AMap)
// Vue.use(ElementUI, {
//   i18n: (key, value) => i18n.t(key, value)
// })
Vue.use(dataV)

Vue.config.productionTip = false
// 挂载全局
Vue.prototype.$http = httpRequest // ajax请求方法
Vue.prototype.hasPermission = utils.hasPermission // 权限方法
Vue.prototype.treeDataTranslate = utils.treeDataTranslate // 树形数据转换
Vue.prototype.$utils = utils
Vue.prototype.$window = window
Vue.prototype.$dictUtils = dictUtils
Vue.prototype.$common = common
Vue.prototype.recover = utils.recover
Vue.prototype.recoverNotNull = utils.recoverNotNull
Vue.prototype.$axios = axios
Vue.prototype.validator = validator
Vue.prototype.lodash = lodash
Vue.prototype.moment = moment
Vue.prototype.deepClone = utils.deepClone
Vue.prototype.validatenull = utils.validatenull
Vue.prototype.$events = new Vue()
Vue.prototype.TcPlayer = TcPlayer
Vue.prototype.flexWidth = utils.flexWidth
utils.printLogo()

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG = {}
window.SITE_CONFIG['storeState'] = cloneDeep(store.state)

AMap.initAMapApiLoader({
  key: '632faa22ab2bb69b4e21105c8142cbcb',
  plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor'],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.4'
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
