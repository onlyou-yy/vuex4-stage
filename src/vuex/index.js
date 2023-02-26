import {inject,provide,reactive} from "vue"

export function forEachValue(obj,fn){
  Object.keys(obj).forEach(key => {
    fn(obj[key],key)
  })
}

const storeKey = "store";
class Store(){
  constructor(options){
    //为了使数据变成响应式的，Vuex3内部会创造一个Vue实例
    //但是Vuex4是直接使用Vue3提供的方法 reactive
    const store = this
    //为什么不直接代理 options.state，而是要多加一层 {data}
    //因为vuex 中有个 replaceState 方法，用来替换 state数据
    //如果直接代理options.state,在替换state的时候页面就不会刷新，状态也不会改变
    //而使用 store._state.data = newState 就可以监听修改，从而触发页面更新
    store._state = reactive({data:options.state})

    //设置 getters
    const _getters = options.getters;
    store.getters = {};
    forEachValue(_getters,function(fn,key)=>{
      Object.defineProperty(store.getters,key,{
        get:()=>fn(store.state);
      })
    })

    // {} 这样创建对象是有原形链的
    // Object.create(null) 创建的对象是没有原形链的
    store._mutations = Object.create(null);
    store._actions = Object.create(null);
    const _mutations = options.mutations;
    const _actions = options.actions;
    
    forEachValue(_mutations,function(fn,key){
      store._mutations[key] = (payload)=>{
        fn.call(store,store.state,payload);
      }
    })

    forEachValue(_actions,function(fn,key){
      store._actions[key] = (payload)=>{
        fn.call(store,store,payload);
      }
    })
  }
  //写成箭头函数，防止结构出来之后 this指向不正确
  commit = (type,payload) => {
    this._mutations[type](payload)
  }
  dispatch = (type,payload) => {
    this._actions[type](payload);
  }
  get state(){
    return this._state.data;
  }
  /**
   * 注册插件
   * app 是 Vue实例
   * injectKey 是当前store实例的名
   */
  install(app,injectKey){
    //全局提供实例给别人用
    //给根app增加一个_provides，子组件会向上进行查找
    provide(injectKey || storeKey,this)
    //Vue2提供全局方法或者属性是通过原型链的形式
    //Vue3是通过配置
    app.config.globalProperties.$store = this;
  }
}

/**
 * 创建store实例
 * @param {*} options 
 */
export function createStore(options){
  return new Store(options)
}


export function useStore(injectKey){
  //取出 store 使用
  return inject(injectKey ?? storeKey);
}