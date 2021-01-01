import Vue from 'vue'
import App from './App.vue'

import { Upload, Button, Message, Table, TableColumn, Loading } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.component(Upload.name, Upload);
Vue.component(Button.name, Button);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.use(Loading.directive);
Vue.prototype.$message = Message;

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
