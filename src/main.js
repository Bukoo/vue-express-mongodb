import Vue from 'vue'
import App from './App'
import toastr from 'toastr'  // jQuery 通知插件
import 'toastr/build/toastr.min.css'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import Faker from 'vue-faker'
// import './assets/icon.css'
import router from './router'
import axios from 'axios'

Vue.use(Antd)
Vue.use(Faker, {locale: 'zh_CN'})
Vue.prototype.$http = axios
Vue.prototype.toastr = toastr

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
// Vue.filter('imgUrlPrefix',(value) => {
//   const url = value.substr(7)
//   const prefix = "https://images.weserv.nl/?url="
//   return prefix + url
// })
Vue.filter('castsToString',(casts) => {
  return casts.map(item => {
    return item.name
  })
})

/* eslint-disable no-new */
new Vue({
  created(){
    toastr.success('启动成功!')
  },
  router,
  render: h => h(App)
}).$mount('#app')
