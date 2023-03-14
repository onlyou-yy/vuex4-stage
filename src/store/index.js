import { createStore } from '../vuex'

export default createStore({
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
      state:{name:"a"}
    },
    moduleB:{
      namespaced:true,
      state:{name:"b"},
      modules:{
        moduleD:{
          namespaced:true,
          state:{name:"b"},
        }
      }
    },
    moduleC:{
      namespaced:true,
      state:{name:"c"}
    },
  }
})
