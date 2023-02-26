<template>
  <div>
    <p>PageB Count : {{count}}  {{$store.state.count}}</p>
    <p>PageB Double : {{double}}  {{$store.getters.double}}</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name:"PageB",
  setup() {
    let store = useStore();
    return {
      count:computed(()=>{store.state.count}),
      double:computed(()=>{store.getters.double}),
    }
  },
}
</script>
