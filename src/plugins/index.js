import YearPicker from './yearpicker'

const components = [
  YearPicker
]

const install = function(Vue) {
  // if(install.installed) return
  components.map(component => Vue.component(component.name, component))
}

YearPicker.install = function install(Vue) {
  Vue.component(YearPicker.name, YearPicker);
}

export default {
  install,
  ...components
};