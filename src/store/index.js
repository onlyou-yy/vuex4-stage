// import { createStore } from 'vuex'
import { createStore } from '../vuex'

function customPlugin(store){
  //在初始化的时候会执行一次
  let local = localStorage.getItem("VUEX:STATE")
  if(local){
    store.replaceState(JSON.parse(local));
  }

  store.commit("add",4)

  //顶叶事件，在每次状态变更的时候也会执行
  store.subscribe((mutation,state)=>{
    localStorage.setItem("VUEX:STATE",JSON.stringify(state))
  })
}

const store = createStore({
  plugins:[
    customPlugin,
  ],
  strict:true,
  state: {
    count:0
  },
  getters:{
    count(state){
      return state.count
    },
    double(state){
      return state.count * 2;
    }
  },
  mutations: {
    add(state,payload){
      state.count += payload;
    },
    asyncMuta(state,payload){
      setTimeout(()=>{
        state.count += payload;
      },20)
    }
  },
  actions: {
    addAsync({commit},payload){
      setTimeout(()=>{
        commit("add",payload);
      },1000)
    }
  },
  modules:{
    moduleA:{
      namespaced:true,
      state:{count:100},
      mutations:{
        add:(state,payload) => state.count += payload
      }
    },
    moduleB:{
      namespaced:true,
      state:{count:200},
      mutations:{
        add:(state,payload) => state.count += payload
      }
    },
  }
})

//一个模块代表注册到根模块
store.registerModule(['moduleC'],{
  namespaced:true,
  state:{count:300},
  mutations:{
    add:(state,payload) => state.count += payload
  },
})

//多个模块代表注册到前一个模块
store.registerModule(['moduleB','moduleD'],{
  namespaced:true,
  state:{count:400},
  mutations:{
    add:(state,payload) => state.count += payload
  },
})

export default store
