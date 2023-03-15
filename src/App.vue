<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <page-a></page-a>
  <hr>
  <page-b></page-b>
  <hr>
  <div>root state count:{{ rootCount }}</div>
  <hr>
  <div>moduleA count:{{ modACount }}</div>
  <hr>
  <div>moduleB count:{{ modBCount }}</div>
  <hr>
  <div>moduleC count:{{ modCCount }}</div>
  <hr>
  <div>moduleD count:{{ modDCount }}</div>
  <p>
    <button @click="add">add</button> <br>
    <button @click="addAsync">addAsync</button> <br>
    <button @click="asyncMuta">asyncMuta</button> <br>
    <button @click="addModCount()">add root</button> <br>
    <button @click="addModCount('moduleA')">add A count</button> <br>
    <button @click="addModCount('moduleB')">add B count</button> <br>
    <button @click="addModCount('moduleC')">add C count</button> <br>
    <button @click="addModCount('moduleB/moduleD')">add D count</button>
  </p>
</template>

<script>
import { computed } from 'vue';
// import { useStore } from 'vuex'
import { useStore } from './vuex'
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
  function asyncMuta(){
    store.commit("asyncMuta",1);
  }
  return {
    add,
    addAsync,
    asyncMuta
  };
}

function useModuleCount(){
  const store = useStore();
  const rootCount = computed(()=>store.state.count);
  const modACount = computed(()=>store.state.moduleA.count);
  const modBCount = computed(()=>store.state.moduleB.count);
  const modCCount = computed(()=>store.state.moduleC.count);
  const modDCount = computed(()=>store.state.moduleB.moduleD.count);
  const addModCount = (modName)=>store.commit(`${modName ? modName + '/' : ''}add`,1);
  return {
    addModCount,
    rootCount,
    modACount,
    modBCount,
    modCCount,
    modDCount,
  }
}

export default {
  name: 'App',
  components: {
    [PageA.name]:PageA,
    [PageB.name]:PageB,
  },
  setup(){
    let {add,addAsync,asyncMuta} = useCount();
    let {rootCount,modACount,modBCount,modCCount,modDCount,addModCount} = useModuleCount();
    return {
      add,
      addAsync,
      rootCount,
      modACount,
      modBCount,
      modCCount,
      modDCount,
      addModCount,
      asyncMuta
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
