import {reactive} from "vue"
import { storeKey } from "./injectKey";
import ModuleCollection from "./module/module-collection";
import { forEachValue, isPromise } from "./utils";

export function getNestedState(state,path){
  return path.reduce((state,key)=>state[key],state);
}

/**
 * 递归安装状态
 * @param {*} store 
 * @param {*} rootState 根状态 
 * @param {*} path 递归路径
 * @param {*} module 根模块
 */
function installModule(store,rootState,path,module){
  const isRoot = path.length;

  if(!isRoot){
    const parentState = path.slice(0,-1).reduce((state,key)=>state[key],rootState)
    parentState[path[path.length - 1]] = module.state;
  }

  module.forEachGetter((getter,key)=>{
    store._wrappedGetters[key] = ()=>{
      //因为module.state 并不是一个响应式的对象，而store.state是
      return getter(getNestedState(store.state,path));
    }
  })

  module.forEachMutation((mutation,key)=>{
    let entry = store._mutations[key] || (store._mutations[key] = []);
    entry.push((payload)=>{
      mutation.call(store,getNestedState(store.state,path),payload);
    })
  })

  //action 执行后返回的是一个 promise
  module.forEachAction((action,key)=>{
    let entry = store._actions[key] || (store._actions[key] = []);
    entry.push((payload)=>{
      let res = action.call(store,store,payload);
      if(!isPromise(res)){
        return Promise.resolve(res);
      }
      return res;
    })
  })

  module.forEachChild((child,key)=>{
    installModule(store,rootState,path.concat(key),child)
  })
}

function resetStoreState(store,state){
  store._state = reactive({data:state});

  const wrappedGetters = store._wrappedGetters;
  store.getters = {};
  forEachValue(wrappedGetters,(getter,key)=>{
    Object.defineProperty(store.getters,key,{
      get:()=>getter(),
      enumerable:true,
    })
  })


}

export default class Store{
  constructor(options){

    const store = this;
    store._modules = new ModuleCollection(options)

    store._wrappedGetters = Object.create(null)
    store._mutations = Object.create(null)
    store._actions = Object.create(null)
    
    const state = store._modules.root.state;
    installModule(store,state,[],store._modules.root);
    resetStoreState(store,state);
  }
  //写成箭头函数，防止结构出来之后 this指向不正确
  commit = (type,payload) => {
    let entry = this._mutations[type] || []
    entry.forEach(mutation=>{
      mutation(payload)
    })
  }
  dispatch = (type,payload) => {
    let entry = this._actions[type] || []
    return Promise.all(entry.map(handler => handler(payload)));
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
    app.provide(injectKey || storeKey,this)
    //Vue2提供全局方法或者属性是通过原型链的形式
    //Vue3是通过配置
    app.config.globalProperties.$store = this;
  }
}