<template>
  <div>
    <p>PageA Count : {{count}}  {{$store.state.count}}</p>
    <p>PageA Double : {{double}}  {{$store.getters.double}}</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from '../vuex'

export default {
  name:"PageA",
  setup() {
    let store = useStore();
    return {
      count:computed(()=>store.state.count),
      double:computed(()=>store.getters.double),
    }
  },
}
</script>
