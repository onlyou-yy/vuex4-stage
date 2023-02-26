<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <page-a></page-a>
  <hr>
  <page-b></page-b>
  <p>
    <button @click="add">add</button>
    <button @click="addAsync">addAsync</button>
  </p>
</template>

<script>
import { useStore } from 'vuex'
import PageA from './views/PageA.vue'
import PageB from './views/PageB.vue'

function useCount(){
  let store = useStore();
  function add(){
    store.commit("add",1);
  }
  function addAsync(){
    store.dispatch("addAsync",1);
  }
  return {add,addAsync};
}

export default {
  name: 'App',
  components: {
    [PageA.name]:PageA,
    [PageB.name]:PageB,
  },
  setup(){
    let {add,addAsync} = useCount();
    return {
      add,addAsync,
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
