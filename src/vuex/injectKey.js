import {inject} from "vue"

export const storeKey = "store";
export function useStore(injectKey){
  //取出 store 使用
  return inject(injectKey ?? storeKey);
}