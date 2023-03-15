import { createStore } from '../vuex'

export default createStore({
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
      state:{count:200},
      mutations:{
        add:(state,payload) => state.count += payload
      },
      modules:{
        moduleD:{
          namespaced:true,
          state:{count:400},
          mutations:{
            add:(state,payload) => state.count += payload
          },
        }
      }
    },
    moduleC:{
      state:{count:300},
      mutations:{
        add:(state,payload) => state.count += payload
      },
    },
  }
})
