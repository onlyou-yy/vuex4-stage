import {reactive,watch} from "vue"
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
  const isRoot = path.length === 0;

  const namespaced = store._modules.getNamespaced(path);
  console.log(namespaced);

  if(!isRoot){
    const parentState = path.slice(0,-1).reduce((state,key)=>state[key],rootState)
    parentState[path[path.length - 1]] = module.state;
  }

  module.forEachGetter((getter,key)=>{
    store._wrappedGetters[namespaced + key] = ()=>{
      //因为module.state 并不是一个响应式的对象，而store.state是
      return getter(getNestedState(store.state,path));
    }
  })

  module.forEachMutation((mutation,key)=>{
    let entry = store._mutations[namespaced + key] || (store._mutations[namespaced + key] = []);
    entry.push((payload)=>{
      mutation.call(store,getNestedState(store.state,path),payload);
    })
  })

  //action 执行后返回的是一个 promise
  module.forEachAction((action,key)=>{
    let entry = store._actions[namespaced + key] || (store._actions[namespaced + key] = []);
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

  if(store.strict){
    enableStrictMode(store);
  }
}
function enableStrictMode(store){
  watch(()=>store._state.data,()=>{// 监控到数据变化后执行回调
    console.assert(store._commiting,'不要在mutation中用异步代码修改状态')
  },{deep:true,flush:'sync'});//watch 默认是异步执行的，我们需要改成同步的
}
export default class Store{
  constructor(options){

    const store = this;
    store._modules = new ModuleCollection(options)

    store._wrappedGetters = Object.create(null)
    store._mutations = Object.create(null)
    store._actions = Object.create(null)

    //是否开启严格模式：
    //  state 不能直接修改
    //  mutations 不能写异步代码
    store.strict = options.strict || false;

    //用来判断 mutations 是否是异步执行
    //在执行mutation之前 _commiting = true;
    //执行mutation之后  _commiting = false
    //执行mutation会更改状态，监控这个状态，如果当前状态变化的时候 _commiting 为 true，就是同步的
    store._commiting = false;
    
    const state = store._modules.root.state;
    installModule(store,state,[],store._modules.root);
    resetStoreState(store,state);

    const plugins = options.plugins || []
    store._subscribes = [];
    plugins.forEach(plugin => plugin(store));
  }
  _withCommit(fn){
    const commiting = this._commiting;
    this._commiting = true;
    fn();
    this._commiting = commiting;
  }
  subscribe(fn){
    this._subscribes.push(fn)
  }
  replaceState(newState){
    //严格模式下状态不允许直接修改
    //需要将 _commiting 修改成 true 之后避免触发 assert 断言提示
    this._withCommit(()=>{
      this._state.data = newState;
    })
  }
  //写成箭头函数，防止结构出来之后 this指向不正确
  commit = (type,payload) => {
    let entry = this._mutations[type] || []
    this._withCommit(()=>{
      entry.forEach(mutation=>mutation(payload))
    })
    this._subscribes.forEach(fn=>fn({type,payload},this.state))
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