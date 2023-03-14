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
      state:{name:"a"}
    },
    moduleB:{
      state:{name:"b"},
      modules:{
        moduleD:{name:"d"}
      }
    },
    moduleC:{
      state:{name:"c"}
    },
  }
})
