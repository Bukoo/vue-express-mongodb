import Vue from 'vue'
import Router from 'vue-router'
import Experimental from 'components/Experimental'
import Home from 'components/Home'
import Contrast from 'components/Contrast'
// import List from 'components/List'
// import Detail from 'components/Detail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/experimental',
      name: 'experimental',
      component: Experimental
    },
    {
      path: '/contrast',
      name: 'contrast',
      component: Contrast
    },
    {
      path: '*',
      redirect : '/'
    }
  ]
})
